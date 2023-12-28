import {
  reject,
  uniqBy,
  identity as I,
  when,
  indexOf,
  values,
  mergeRight,
  objOf,
  head,
  tail,
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
import { log } from './log'
import { sep as SEP, relative as relativePath } from 'node:path'
import deptree from 'dependency-tree'

/**
 * Generate a dependency tree, given a config, a directory, and a filename
 * @name plant
 * @example
 * ```js
 * import { plant } from 'bloodline'
 * const tree = plant({}, '../..', '../monocle/cli.js')
 * ```
 */
export const plant = curry((config, directory, filename) =>
  deptree({ ...config, filename, directory })
)

/**
 * Test whether a path includes `'node_modules'` within it.
 * @name isNodeModule
 * @example
 * ```js
 * import { isNodeModule } from 'bloodline/tree'
 * isNodeModule('./node_modules/ramda') // true
 * ```
 */
const $NODE = 'node_modules'
const isNodeModule = includes($NODE)

const getNodeModule = z => {
  const i = indexOf($NODE, z)
  if (i > -1) {
    const cut = z.slice(i + $NODE.length + 1)
    return cut.slice(0, indexOf(SEP, cut))
  } else {
    return z
  }
}

/**
 * Test whether a path includes `'.git'` within it.
 * @name isGitPath
 * @example
 * ```js
 * import { isGitPath } from 'bloodline/tree'
 * isGitPath('.git/config') // true
 * ```
 */
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

/**
 * Grab an id from a cache if possible
 * @name getId
 * @example
 * ```js
 * import { getId } from 'bloodline/tree'
 * const basePath = '..'
 * const cache = {}
 * const key = 'a'
 * console.log(getId(basePath, cache, key)) // 'bloodline/a'
 * ```
 */
export const getId = curry((basePath, cache, key) => {
  if (cache[key]) {
    return cache[key]
  }
  const lookup = relativePath(basePath, key)
  cache[key] = lookup
  return lookup
})

/**
 * Take a dependency tree and recursively walk it, returning a grouped set of dependencies.
 * @name groupTree
 * @see {@link flattenTree}
 * @example
 * ```js
 * import { groupTree, plant } from 'bloodline/tree'
 * const config = { basePath: '../..' }
 * const tree = plant(config, '..', '../monocle/cli.js')
 * const grouped = groupTree(config, {}, {}, tree)
 * ```
 */
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

const modulate = when(isNodeModule, getNodeModule)

export const familyTree = curry((config, tree, cache, searchSpace) =>
  pipe(
    groupTree(config, tree, cache),
    log.tree('grouped!'),
    map(
      pipe(
        reduce((stack, x) => {
          const h = head(x)
          const t = tail(x)
          // if (isNodeModule(h)) {
          // return mergeRight(stack, objOf(getNodeModule(h), []))
          // }
          const mh = modulate(h)
          const cleaned = pipe(
            map(modulate),
            reject(z => z === mh),
            uniqBy(I)
          )(t)
          return mergeRight(stack, objOf(mh, cleaned))
        }, {})
      )
    ),

    values,
    head
  )(searchSpace)
)

/**
 * Take a dependency tree and recursively walk it, returning flattened set of dependencies.
 * @name flattenTree
 * @see {@link groupTree}
 * @example
 * ```js
 * import { flattenTree, plant } from 'bloodline/tree'
 * const config = { basePath: '../..' }
 * const tree = plant(config, '..', '../monocle/cli.js')
 * const flattened = flattenTree(config, {}, {}, tree)
 * ```
 */
export const flattenTree = curry((config, tree, cache, searchSpace) =>
  pipe(
    groupTree(config, $, cache, searchSpace),
    map(reduce((agg, x) => concat(agg, x), []))
  )(tree)
)
