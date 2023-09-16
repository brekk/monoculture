import { join, normalize } from 'node:path'
import { curry } from 'ramda'

// pathRelativeTo :: String -> String -> String
export const pathRelativeTo = curry((pwd, x) => join(pwd, normalize(x)))
