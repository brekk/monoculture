import { curry } from 'ramda'

export const insertAfter = curry((idx, x, arr) => [
  ...arr.slice(0, idx + 1),
  x,
  ...arr.slice(idx + 1, Infinity),
])
