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

export const histogramBy = curry((pred, list) =>
  pipe(groupBy(pred), map(length), toPairs)(list)
)
export const rarestBy = curry((pred, list) =>
  pipe(
    histogramBy(pred),
    x => x.sort(([_1, v], [_2, v2]) => v - v2),
    when(pipe(length, equals(0)), always([[]])),
    head,
    head
  )(list)
)
