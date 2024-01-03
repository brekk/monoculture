import { curry, pipe, map, reject, any } from 'ramda'

export const snd = ([, v]) => v
export const tupleValueTransform = curry(function _tupleValueTransform(
  fn,
  [k, v]
) {
  return [k, fn(v)]
})
export const tupleTransform = curry(function _tupleTransform(hoc, fn, list) {
  return hoc(tupleValueTransform(fn), list)
})
export const applySecond = curry(function _applySecond(hoc, fn, list) {
  return hoc(pipe(tupleValueTransform(fn), snd), list)
})
export const mapSnd = tupleTransform(map)
export const rejectSnd = applySecond(reject)
export const anySnd = applySecond(any)
