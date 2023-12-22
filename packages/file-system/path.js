import { join, normalize } from 'node:path'
import { curry } from 'ramda'

// pathRelativeTo :: String -> String -> String
export const pathRelativeTo = curry((pwd, x) => {
  if (typeof pwd !== 'string' || typeof x !== 'string') {
    throw new Error('Cannot normalize bad paths.')
  }
  return join(pwd, normalize(x))
})
