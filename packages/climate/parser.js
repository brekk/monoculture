import { curry } from 'ramda'

import yargsParser from 'yargs-parser'

export const parse = curry(function _parse(opts, args) {
  return yargsParser(args, opts)
})
