import { curry } from 'ramda'

export const mash = curry((a, b) => Object.assign(a, b))
export const neue = mash({})
export const manyNew = x => Object.assign({}, ...x)
