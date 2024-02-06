import { curry } from 'ramda'

export const repeat = curry((s, x) => s.repeat(x))
export const search = curry((r, s) => s.search(r))

export const trimEnd = x => x.trimEnd()
export const trimStart = x => x.trimStart()
