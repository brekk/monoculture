import { curry } from 'ramda'
import yargsParser from 'yargs-parser'

// parser :: YargsConfig -> List String -> Object
export const parser = curry(function _parser(opts, args) {
  return yargsParser(args, opts)
})

export const YARGS_CONFIG = {
  alias: {
    input: ['i'],
    output: ['o'],
    search: ['s'],
    artifact: ['a'],
    ignore: ['g'],
    color: ['k'],
    debug: ['d'],
    monorepo: ['m'],
    processor: ['p'],
  },
  array: ['input'],
  boolean: ['color', 'debug', 'monorepo'],
  configuration: {
    'strip-aliased': true,
  },
}

export const HELP_CONFIG = {
  help: 'This text!',
  color: 'Render stuff in color',
  input:
    // eslint-disable-next-line max-len
    'A file to read! (Can be specified multiple times.) If running in monorepo mode, this should be your root `package.json`.',
  output: 'The file to output!',
  search: "The glob to use for searching (default: '**/*.{js,jsx,ts,tsx}')",
  artifact: `Would you like to create an artifact file?
(Useful for downstream transformation)`,
  ignore: 'Files to ignore when searching, can be specified multiple times',
  debug: 'Generate additional information when processing content.',
  monorepo: 'Process content for a monorepo (walking all "workspaces")',
  processor: 'Specify a processor to use when running doctor-general',
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
  debug: false,
}
