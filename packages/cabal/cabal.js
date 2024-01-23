import { curry } from 'ramda'

/**
 * @name hasOrAdd
 * @exported
 * @example
 * ```js test=true
 * const s = new Set()
 * const key = Math.floor(Math.random() * 1e3)
 * s.add(key)
 * const hooked = hasOrAdd(s)
 * expect(hooked(key)).toBeTruthy()
 * expect(hooked('nice')).toBeFalsy()
 * ```
 */
export const hasOrAdd = curry(function _hasOrAdd(set, x) {
  const had = set.has(x)
  if (!had) {
    set.add(x)
  }
  return had
})
