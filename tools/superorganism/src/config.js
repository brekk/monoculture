export const YARGS_CONFIG = {
  alias: {
    // these come from `nps`
    silent: ['s'],
    scripts: [],
    config: ['c'],
    logLevel: ['l'],
    require: ['r'],
    helpStyle: ['y'],
    // these are things we've added
    future: ['f'],
    color: ['k'],
    commonjs: ['cjs', 'p'],
  },
  array: ['require'],
  boolean: ['silent', 'scripts', 'future', 'color', 'commonjs'],
  configuration: {
    'strip-aliased': true,
  },
}

/* eslint-disable max-len */
export const HELP_CONFIG = {
  help: 'This text!',
  silent: 'Silence superorganism output',
  scripts: 'Log command text for script',
  config: `Config file to use (defaults to nearest package-scripts.js)`,
  logLevel: `The log level to use (error | warn | info | debug)`,
  require: `Module to preload`,
  helpStyle: `Choose the level of detail displayed by the help command`,
  future: `Use Futures instead of Promises`,
  color: `Render things with color`,
  commonjs: `For backwards compatibility with \`nps\`, use this with cjs config files`,
}
/* eslint-enable max-len */

export const CONFIG_DEFAULTS = {
  scripts: true,
  future: false,
  helpStyle: 'all',
  color: true,
  commonjs: false,
}
