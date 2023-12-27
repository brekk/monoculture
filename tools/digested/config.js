export const YARGS_CONFIG = {
  alias: {
    // boolean
    color: ['k'],
    readme: ['m'],
    deps: ['s'],
    api: ['s'],
    // string
    pkgPath: ['pkg', 'p'],
    drGenPath: ['drgen', 'd'],
    docUrl: ['u'],
    repoUrl: ['r'],
  },
  boolean: ['readme', 'deps', 'api'],
  configuration: {
    'strip-aliased': true,
  },
}

export const HELP_CONFIG = {
  pkgPath: 'The path to the `package.json` file.',
  drGenPath: 'An optional path to a dr-generated.json file',
  docUrl: 'The URI of a documentation site, used in generating links',
  repoUrl: 'The URI of a repository, used in generating links',
  // booleans
  help: 'This text!',
  color: 'Render stuff in glorious color',
  readme: 'Generate content for a readme (in markdown!)',
  deps: 'Add dependency information [default: true] (only applicable with `--readme`)',
  api: 'Add API information [default: true] (only applicable with `--readme`)',
}

export const CONFIG_DEFAULTS = {
  readme: false,
  api: true,
  deps: true,
  color: true,
}
