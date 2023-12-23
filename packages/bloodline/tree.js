import { pipe, toPairs, forEach, keys, curry } from 'ramda'
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

export const flattenTree = curry(({ basePath }, tree, cache, searchSpace) => {
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
              _tree[id].push(_id)
              pipe(
                keys,
                forEach(k => _tree[id].push(lookup(k)))
              )(depList)
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
