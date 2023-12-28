import { curry } from 'ramda'

export const stringifyJSONWithReplacer = curry((replacer, indent, x) =>
  JSON.stringify(x, replacer, indent)
)
export const stringifyJSON = stringifyJSONWithReplacer(null)
export const j2 = stringifyJSON(2)
