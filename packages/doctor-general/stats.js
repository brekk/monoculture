import {
  length,
  curry,
  pipe,
  groupBy,
  map,
  toPairs,
  when,
  equals,
  always,
  head,
} from 'ramda'

export const histogramBy = curry(function _histogramBy(pred, list) {
  return pipe(groupBy(pred), map(length), toPairs)(list)
})
export const rarestBy = curry(function _rarestBy(pred, list) {
  return pipe(
    histogramBy(pred),
    x => x.sort(([_1, v], [_2, v2]) => v - v2),
    when(pipe(length, equals(0)), always([[]])),
    head,
    head
  )(list)
})
