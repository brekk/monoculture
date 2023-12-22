import { curry, pipe, map, reject, any } from 'ramda'

export const snd = ([, v]) => v
export const tupleValueTransform = curry((fn, [k, v]) => [k, fn(v)])
export const tupleTransform = curry((hoc, fn, list) =>
  hoc(tupleValueTransform(fn), list)
)
export const applySecond = curry((hoc, fn, list) =>
  hoc(pipe(tupleValueTransform(fn), snd), list)
)
export const mapSnd = tupleTransform(map)
export const rejectSnd = applySecond(reject)
export const anySnd = applySecond(any)
