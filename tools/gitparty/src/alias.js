import { curry, mergeRight } from 'ramda'
export const alias = curry(function _alias(object, from, to) {
  if (!object[to]) {
    object[to] = from
  }
  if (!object[from]) {
    object[from] = object[to]
  }
})

export const pureAliasedListeners = curry(
  function _pureAliasedListeners(subscriber, original, alt, seed) {
    const emitted = mergeRight(seed, { [alt]: original, [original]: original })
    subscriber(emitted)
    return emitted
  }
)

export const getAliasFrom = curry(function _getAliasFrom(object, key) {
  return (object && object[key]) || key
})

export const canonicalize = object => ({
  canonize: (a, b = a) => alias(object, a, b),
  getCanon: getAliasFrom(object),
})
