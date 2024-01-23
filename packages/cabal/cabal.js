import { curry } from 'ramda'

export const hasOrAdd = curry(function _hasOrAdd(set, x) {
  const had = set.has(x)
  if (!had) {
    set.add(x)
  }
  return had
})
