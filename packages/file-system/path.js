import { join, normalize } from 'node:path'
import { curry } from 'ramda'

// pathJoin :: String -> String -> String
export const pathJoin = curry((pwd, x) => {
  // TODO: this should ostensibly be the province of a type system to ensure this safety
  if (typeof pwd !== 'string' || typeof x !== 'string') {
    throw new Error('Cannot normalize bad paths.')
  }
  return join(pwd, normalize(x))
})
