import { curry } from 'ramda'

import yargsParser from 'yargs-parser'

export const parse = curry((opts, args) => yargsParser(args, opts))
