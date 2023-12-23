import {
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
import { relative as relativePath } from 'node:path'
import deptree from 'dependency-tree'

export const plant = curry((config, haystack, needle) =>
  deptree({ filename: needle, directory: haystack, ...config })
)

export const getId = curry((basePath, cache, key) => {
  if (cache[key]) {
    return cache[key]
  }
  const lookup = relativePath(basePath, key)
  cache[key] = lookup
  return lookup
})

export const partialFlattenTree = curry(
  ({ basePath }, tree, cache, searchSpace) => {
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
  }
)

export const flattenTree = curry((config, tree, cache, searchSpace) =>
  pipe(
    partialFlattenTree(config, $, cache, searchSpace),
    map(reduce((agg, x) => concat(agg, x), []))
  )(tree)
)
