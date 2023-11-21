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
  },
  boolean: ['excludeMergeCommits', 'collapseAuthors', 'init'],
  array: ['aliases'],
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
  filter: `Filter commits based on a simple 'key:value' / 'key:value#key2:value2' base syntax:
\`-f "hash:80ca7f7" / -f "date:20-05-2018"\`
\tLookup by exact string matching (default)
\`-f "subject:fix~"\`
\tLookup by looser indexOf matching when there is a tilde "~" character at the end of the value
\`-f "subject:fix~#date:20-05-2018"\`
\tLookup with multiple facets, separated by a hash "#" symbol
\`-f "author:brekk"\`
\tWhen filtering by author, the alias lookup (if aliases have been defined) is used
\`-f "files:**/src/*.spec.js"\`
\tWhen there are asterisks present in the value side (after the ":") and the key is an array, glob-style matching is performed
\`-f "analysis.config:true"\`
\tWhen there is a period "." in the key, nested-key lookups will be performed
\`-f "x:true" / -f "x:false"\`
\tWhen the value is either the literal string "true" or "false", it will be coerced into a boolean`,
  timezone: 'Set the timezone you want to see results in. Defaults to UTC',
  aliases:
    'Define author aliases (useful if authors do not merge under consistent git `user.name`s / `user.email`s)',
}

export const DEFAULT_CONFIG_FILE = {
  gitpartyrc: {
    key: 'G',
    color: 'bgRed',
    matches: ['**/.gitpartyrc*', '**/.gitpartyrc'],
  },
  collapseAuthors: false,
  timezone: 'UTC',
}
export const MAKE_A_GITPARTYRC_FILE = c =>
  `Unable to find a .gitpartyrc file! You can create one with \`${c.yellow(
    'gitparty --init'
  )}\``

export const THIS_IS_NOT_A_GIT_REPO = c =>
  `gitparty only works in git repositories! Did you mean to \`${c.yellow(
    'git init'
  )}\` first?`
