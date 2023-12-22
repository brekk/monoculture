import { unless } from 'ramda'

export const wrap = x => [x]
export const autobox = unless(Array.isArray, wrap)
export const fresh = z => z.slice()
