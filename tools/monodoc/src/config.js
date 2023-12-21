import { curry } from 'ramda'
import yargsParser from 'yargs-parser'

// parser :: YargsConfig -> List String -> Object
export const parser = curry((opts, args) => yargsParser(args, opts))

export const YARGS_CONFIG = {
  alias: {
    input: ['i'],
    output: ['o'],
    search: ['s'],
    artifact: ['a'],
    ignore: ['g'],
    color: ['k'],
  },
  boolean: ['color'],
  configuration: {
    'strip-aliased': true,
  },
}

export const HELP_CONFIG = {
  help: 'This text!',
  color: 'Render stuff in color',
  input: 'A file to read!',
  output: 'The file to output!',
  search: "The glob to use for searching (default: '**//*.{js,jsx,ts,tsx}')",
  artifact: `Would you like to create an artifact file?
(Useful for downstream transformation)`,
  ignore: 'Files to ignore when searching, can be specified multiple times',
}

export const CONFIG_DEFAULTS = {
  color: true,
  ignore: [
    '**/node_modules/**',
    '**/coverage/**',
    '**/*.spec.{js,jsx,ts,tsx}',
    '**/fixture/**',
    '**/fixture.*',
  ],
  search: '**/*.{js,jsx,ts,tsx}',
}
