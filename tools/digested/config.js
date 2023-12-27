export const YARGS_CONFIG = {
  alias: {
    readme: ['m'],
    showDeps: ['s'],
    drGenPath: ['d'],
    repo: ['r'],
    pkg: ['i'],
  },
  boolean: ['readme', 'showDeps'],
  configuration: {
    'strip-aliased': true,
  },
}

export const HELP_CONFIG = {
  help: 'This text!',
  color: 'Render stuff in color',
  pkg: 'The path to the `package.json` file.',
  readme: 'Generate content for a readme (in markdown!)',
  showDeps: 'Add dependency information (not applicable in all cases)',
}

export const CONFIG_DEFAULTS = {
  readme: false,
  showDeps: false,
  color: true,
}
