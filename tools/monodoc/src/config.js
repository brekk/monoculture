import { slice, curry, pipe, chain, identity as I } from 'ramda'
import yargsParser from 'yargs-parser'

import { readJSONFile, writeFile } from 'file-system'

// parser :: YargsConfig -> List String -> Object
export const parser = curry((opts, args) => yargsParser(args, opts))

export const YARGS_CONFIG = {
  alias: {
    input: ['i'],
    output: ['o'],
    search: ['s'],
    artifact: ['a'],
    ignore: ['g'],
  },
  configuration: {
    'strip-aliased': true,
  },
}

export const CONFIG_DEFAULTS = {
  ignore: [
    '**/node_modules/**',
    '**/coverage/**',
    '**/*.spec.{js,jsx,ts,tsx}',
    '**/*fixture.*',
    '**/fixture.*',
  ],
  search: '**/*.{js,jsx,ts,tsx}',
}
