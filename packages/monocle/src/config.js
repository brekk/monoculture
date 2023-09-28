export const CONFIG = {
  alias: {
    help: ['h'],
    ignore: ['i'],
    plugin: ['p'],
    rule: ['r'],
    error: ['e'],
    rulefile: ['c'],
  },
  boolean: ['help'],
  array: ['plugin', 'rule', 'ignore'],
  configuration: {
    'strip-aliased': true,
  },
}

export const CONFIG_DEFAULTS = {}

/* eslint-disable max-len */
export const HELP_CONFIG = {
  help: `This text you're reading now!`,
  ignore: `Pass ignore values to glob. Array type`,
  plugin:
    'Specify a plugin to add to the run. Multiple plugins can be specified by invoking monocle with multiple flags, e.g. --plugin x --plugin y',
  rule: 'Specify a rule to add to the run. Multiple rules can be specified by invoking monocle with multiple flags, e.g. --rule one --rule two',
  error: 'Should this invocation be a warning or an error?',
  rulefile:
    'Express the context of a run in a single file. This overrides all other flags (except --help)',
}

/* eslint-enable max-len */
