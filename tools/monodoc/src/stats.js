import {
  length,
  curry,
  pipe,
  groupBy,
  map,
  toPairs,
  sortBy,
  when,
  equals,
  always,
  head,
} from 'ramda'
import { trace } from './trace'

export const histogramBy = curry((pred, list) =>
  pipe(groupBy(pred), map(length), toPairs)(list)
)
export const rarestBy = curry((pred, list) =>
  pipe(
    trace('snake'),
    histogramBy(pred),
    trace('grammmmmm'),
    x => x.sort(([_1, v], [_2, v2]) => v - v2),
    trace('SORTED?'),
    when(pipe(length, equals(0)), always([[]])),
    head,
    head
  )(list)
)
