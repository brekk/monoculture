import { pipe, curry } from 'ramda'

/**
 * A curried binary addition function
 * @name add
 * @example
 * ```ts live=true
 * import { add } from './fixture'
 *
 * add(10)(20) === 30
 * ```
 */
export const add = curry((a, b) => a + b)
