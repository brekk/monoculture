import { map, curry } from 'ramda'

/**
 * Generic comparison function.
 * This can be used to create a number of other more complex functions.
 * @name equalishBy
 * @example
 * ```js test=true
 * const productIdSelector = z => {
 *   const d = z.indexOf('-')
 *   return d > -1 ? z.slice(0, d) : 'NO_MATCH'
 * }
 * const isProduct = equalishBy(productIdSelector, 'coolco')
 *
 * expect(isProduct('coolco-10020')).toBeTruthy()
 * expect(isProduct('otherco-xkswn')).toBeFalsy()
 * expect(isProduct('blabbo')).toBeFalsy()
 * ```
 */
export const equalishBy = curry(
  (transform, expected, x) => transform(x) === expected
)
// I think this is a slight variation on the P combinator / psi function
// https://gist.github.com/Avaq/1f0636ec5c8d6aed2e45

// "typeOf" seems like too much of an obvious footgun
export const ofType = z => typeof z

export const isType = equalishBy(ofType)
export const [isObject, isString, isNumber, isBoolean, isUndefined] = map(
  isType,
  ['object', 'string', 'number', 'boolean', 'undefined']
)
export const isArray = Array.isArray

/**
 * Coerce values to boolean explicitly
 * @name coerce
 * @param {any} x Any value
 * @returns boolean
 * @example
 * ```js test=true
 * expect(coerce(0)).toBeFalsy()
 * expect(coerce('')).toBeFalsy()
 * expect(coerce([])).toBeTruthy()
 * expect(coerce(1)).toBeTruthy()
 * ```
 */
export const coerce = x => !!x
