import { curry } from 'ramda'

export const mash = curry(function _mash(a, b) {
  return Object.assign(a, b)
})
export const neue = mash({})
export const manyNew = x => Object.assign({}, ...x)
