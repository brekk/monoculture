import { curry } from 'ramda'

export const stringifyJSONWithReplacer = curry(
  function _stringifyJSONWithReplacer(replacer, indent, x) {
    return JSON.stringify(x, replacer, indent)
  }
)
export const stringifyJSON = stringifyJSONWithReplacer(null)
export const j2 = stringifyJSON(2)
