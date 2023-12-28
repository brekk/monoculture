import { pipe, curry } from 'ramda'

/**
 * @page minus
 */

/**
 * A curried binary addition function. {@link inlineDetail} Hey there!
 * @name add
 * @example
 * ```ts live=true
 * import { add } from './fixture'
 *
 * add(10)(20) === 30
 * ```
 */
export const subtract = curry((a, b) => a + b)
