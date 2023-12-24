import {
  always as K,
  includes,
  pipe,
  toPairs,
  forEach,
  reduce,
  concat,
  keys,
  curry,
  map,
  __ as $,
} from 'ramda'
import { fresh } from 'inherent'
import { relative as relativePath } from 'node:path'
import deptree from 'dependency-tree'

export const plant = curry((config, directory, filename) =>
  deptree({ ...config, filename, directory })
)
const isNodeModule = includes('node_modules')
const isGitPath = includes('.git')

export const rootedPlant = curry((config, directory, filename) => {
  const npmPaths = {}
  const planted = plant(
    {
      ...config,
      filter: (depPath, $y) => {
        const isNpmPath = isNodeModule(depPath)
        if (isGitPath(depPath)) {
          return false
        }
        const {
          includeNpm = true,
          dependencyFilter: $depFilt = K(true),
          basePath,
        } = config
        const refined = $depFilt(basePath, depPath, $y)

        if (includeNpm && isNpmPath) {
          const y = fresh(npmPaths?.[$y] ?? [])
          y.push(depPath)
          npmPaths[$y] = y
        }

        return !isNpmPath && refined.length
      },
    },

    directory,
    filename
  )
  return { npmPaths, tree: planted }
})

export const getId = curry((basePath, cache, key) => {
  if (cache[key]) {
    return cache[key]
  }
  const lookup = relativePath(basePath, key)
  cache[key] = lookup
  return lookup
})

export const groupTree = curry(({ basePath }, tree, cache, searchSpace) => {
  // we need things to run this tick, so we'll do our recursion within this curried function
  const walker = (_tree, _cache, _searchSpace) => {
    // our lookup is curried and closured to _cache
    const lookup = getId(basePath, _cache)
    pipe(
      toPairs,
      forEach(([key, deps]) => {
        const id = lookup(key)
        if (!_tree[id]) {
          _tree[id] = []
          pipe(
            toPairs,
            forEach(([depName, depList]) => {
              const _id = lookup(depName)
              // _tree[id].push(_id)
              const lookups = pipe(keys, map(lookup))(depList)
              _tree[id] = [..._tree[id], [_id, ...lookups]]
              walker(_tree, _cache, depList)
            })
          )(deps)
        }
      })
    )(searchSpace)
  }
  walker(tree, cache, searchSpace)
  return tree
})

export const flattenTree = curry((config, tree, cache, searchSpace) =>
  pipe(
    groupTree(config, $, cache, searchSpace),
    map(reduce((agg, x) => concat(agg, x), []))
  )(tree)
)
