import { map, curry } from 'ramda'

/**
 * Generic comparison function.
 * This can be used to create a number of other more complex functions.
 * @name equalishBy
 * @example
 * ```js
 * const productIdSelector = z => {
 *   const d = z.indexOf('-')
 *   return d > -1 ? z.slice(0, d) : 'NO_MATCH'
 * }
 * const isProduct = equalishBy(productIdSelector, 'coolco')
 *
 * console.log(`1. ${isProduct('coolco-10020')}`) // true
 * console.log(`2. ${isProduct('otherco-xkswn')}`) // false
 * console.log(`3. ${isProduct('blabbo')}`) // false
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
