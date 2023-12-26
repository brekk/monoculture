import { isEmpty, complement, unless } from 'ramda'

export const wrap = x => [x]
export const autobox = unless(Array.isArray, wrap)
export const fresh = z => z.slice()
export const isNotEmpty = complement(isEmpty)
