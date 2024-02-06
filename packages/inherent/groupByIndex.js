import { curry, pipe, groupBy, nth, map, reduce, concat, remove } from 'ramda'

/*
so there's a pattern in a couple places, it's something like:

pipe(
  groupBy(head),
  map(map(tail))
)

Where we're trying to group by an index and then remove that
index from the resulting grouped content
*/

/**
 * @name groupByIndex
 * @example
 * ```js test=true
 * expect(groupByIndex(0, [
 *   ['spades', 'ace'],
 *   ['diamonds', 'seven'],
 *   ['hearts', 'eight'],
 *   ['clubs', 'jack'],
 *   ['diamonds', 'ace'],
 *   ['spades', 'king'],
 *   ['diamonds', 'four'],
 *   ['spades', 'eight'],
 * ])).toEqual({
 *   clubs: [['jack']],
 *   diamonds: [['seven'], ['ace'], ['four']],
 *   hearts: [['eight']],
 *   spades: [['ace'], ['king'], ['eight']],
 * })
 * ```
 */
export const groupByIndex = curry(function _groupByIndex(i, x) {
  return pipe(groupBy(nth(i)), map(map(remove(i, 1))))(x)
})

/**
 * @name groupFlatByIndex
 * @example
 * ```js test=true
 * expect(groupFlatByIndex(0, [
 *   ['spades', 'ace'],
 *   ['diamonds', 'seven'],
 *   ['hearts', 'eight'],
 *   ['clubs', 'jack'],
 *   ['diamonds', 'ace'],
 *   ['spades', 'king'],
 *   ['diamonds', 'four'],
 *   ['spades', 'eight'],
 * ])).toEqual({
 *   clubs: ['jack'],
 *   diamonds: ['seven', 'ace', 'four'],
 *   hearts: ['eight'],
 *   spades: ['ace', 'king', 'eight'],
 * })
 * ```
 */
export const groupFlatByIndex = curry(function _groupFlatByIndex(i, x) {
  return pipe(groupByIndex(i), map(reduce(concat, [])))(x)
})
