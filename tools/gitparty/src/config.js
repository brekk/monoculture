/* eslint-disable max-len */

export const YARGS_CONFIG = {
  configuration: {
    'strip-aliased': true,
  },
  alias: {
    help: ['h'],
    init: ['i'],
    color: ['k'],
    config: ['c'],
    repo: ['r'],
    timezone: ['t', 'tz'],
    filter: ['f'],
    collapseAuthors: ['a', 'collapse'],
    json: ['j'],
    excludeMergeCommits: ['m'],
    output: ['o'],
    totalCommits: ['n'],
    aliases: ['a', 'alias'],
    dateFormat: ['d'],
    width: ['w'],
    fields: ['e'],
  },
  boolean: ['excludeMergeCommits', 'collapseAuthors', 'init'],
  array: ['aliases', 'fields'],
  number: ['width'],
}
export const CONFIG_DEFAULTS = {
  // this is our config
  excludeMergeCommits: true,
  collapseAuthors: false,
  filter: ``,
  json: false,
  // fill in at runtime
  // repo: process.cwd(),
  // below this line are gitlog configuration
  totalCommits: 50,
  fields: [
    'abbrevHash',
    'subject',
    'authorName',
    'authorDate',
    'authorDateRel',
  ],
  timezone: `UTC`,
  execOptions: { maxBuffer: 1000 * 1024 },
  color: true,
  dateFormat: 'HH:mm',
}
export const HELP_CONFIG = {
  help: 'This text!',
  color: 'Render things in glorious color!',
  init: 'Initialize and create a new `.gitpartyrc` file',
  config: 'Select a config file other than `.gitpartyrc`',
  output:
    'Write the results to a file. Usually useful in concert with the --json flag',
  json: 'Return JSON ouput instead of rendering as strings',
  repo: 'Select a different git repository',
  totalCommits: 'Choose the number of total commits',
  collapseAuthors:
    'Merge commits if the authors are the same and commit dates are the same',
  excludeMergeCommits: 'Exclude merge commits from the results',
  filter: c => {
    const { yellow: y, bold: d, cyan: n } = c
    return `Filter commits based on a simple '${y('key')}:${n('value')}' / '${y(
      'key'
    )}:${n('value')}#${y('key2')}:${n('value2')}' base syntax:
\`-f "${y('hash')}:${n('80ca7f7')}" / -f "${y('date')}:${n('20-05-2018')}"\`
\tLookup by exact string matching (default)
\`-f "${y('subject')}:${n('fix~')}"\`
\tLookup by looser indexOf matching when there is a tilde "~" character at the end of the value
\`-f "${y('subject')}:${n('fix~')}#${y('date')}:${n('20-05-2018')}"\`
\tLookup with multiple facets, separated by a hash "#" symbol
\`-f "${y('author')}:${n('brekk')}"\`
\tWhen filtering by author, the alias lookup (if aliases have been defined) is used
\`-f "${y('files')}:${n('**/src/*.spec.js')}"\`
\tWhen there are asterisks present in the value side (after the ":") and the key is an array, glob-style matching is performed
\`-f "${y('x')}:${n('true')}" / -f "${y('x')}:${n('false')}"\`
\tWhen the value is either the literal string "true" or "false", it will be coerced into a boolean
\`-f "${y('analysis.config')}:${n('true')}"\`
\tWhen there is a period "." in the key, nested-key lookups will be performed`
  },
  timezone: 'Set the timezone you want to see results in. Defaults to UTC',
  aliases:
    'Define author aliases (useful if authors do not merge under consistent git `user.name`s / `user.email`s)',
  dateFormat:
    "Express how you want date-fns to format your dates. (default: 'yyyy-MM-dd HH:kk OOOO')",
  width: 'Set an explicit width',
  fields: 'Specify the fields you want to pull from `gitlog`',
}
export const DEFAULT_CONFIG_FILE = {
  patterns: {
    gitpartyrc: {
      key: 'G',
      color: 'bgRed',
      matches: ['**/.gitpartyrc*', '**/.gitpartyrc'],
    },
  },
  collapseAuthors: false,
  timezone: 'UTC',
}
