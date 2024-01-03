import { curry } from 'ramda'

export const insertAfter = curry(function _insertAfter(idx, x, arr) {
  return [...arr.slice(0, idx + 1), x, ...arr.slice(idx + 1, Infinity)]
})
