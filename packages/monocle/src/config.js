export const CONFIG = {
  alias: {
    help: ['h'],
    showMatchesOnly: ['m', 'showMatches'],
    showTotalMatchesOnly: ['n', 'showTotalMatches'],
    rulefile: ['c'],
    ignore: ['i'],
    plugin: ['p', 'plugins'],
    rule: ['r', 'rules'],
    error: ['e'],
    trim: ['t'],
    output: ['o'],
    jsonIndent: ['j'],
  },
  number: ['jsonIndent'],
  boolean: ['help', 'trim', 'showMatchesOnly'],
  array: ['plugin', 'rule', 'ignore'],
  configuration: {
    'strip-aliased': true,
  },
}

export const CONFIG_DEFAULTS = {
  output: 'monocle-findings.json',
  showMatchesOnly: false,
  showTotalMatchesOnly: false,
  jsonIndent: 2,
}

/* eslint-disable max-len */
export const HELP_CONFIG = {
  help: `This text you're reading now!`,
  ignore: `Pass ignore values to glob. Array type`,
  trim: 'Trim the lines on read',
  plugin: `Specify a plugin to add to the run.
  Multiple plugins can be specified by invoking monocle with multiple flags, e.g.
    monocle --plugin x --plugin y`,
  rule: `Specify a rule to add to the run.
  Multiple rules can be specified by invoking monocle with multiple flags, e.g.
    monocle --rule one --rule two`,
  error: 'Should this invocation be a warning or an error?',
  rulefile: `Express the context of a run in a single file.
  This overrides all other flags (except --help)`,
  output: 'Where should the findings be written?',
  showMatchesOnly: `List the files which matched the search, but *do not* run plugins`,
  showTotalMatchesOnly: `List the number files which matched the search, but *do not* run plugins (implies -m)`,
  jsonIndent: `How much should we indent JSON output? (default: 2)`,
}
/* eslint-enable max-len */
