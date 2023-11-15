import pkg from '../package.json'
import { generateHelp } from 'configurate'

export const YARGS_CONFIG = {
  alias: {
    silent: ['s'],
    scripts: [],
    config: ['c'],
    logLevel: ['l'],
    require: ['r'],
    helpStyle: ['y'],
  },
  array: ['require'],
  boolean: ['silent', 'scripts'],
  configuration: {
    'strip-aliased': true,
  },
}

/* eslint-disable max-len */
export const HELP_CONFIG = {
  help: 'This text!',
  silent:
    'By default, superorganism will log out to the console before running the command. You can add -s to your command to silence this.',
  scripts:
    "By default, the script's command text will log out to the console before running the command. You can add --no-scripts to prevent this.",
  config: `Use a different config

\`\`\`
superorganism -c ./other/package-scripts.js lint
\`\`\`

Normally, superorganism will look for a package-scripts.js file and load that to get the scripts. Generally you'll want to have this at the root of your project (next to the package.json). But by specifying -c or --config, superorganism will use that file instead.`,
  logLevel: `Specify the log level to use`,
  require: `You can specify a module which will be loaded before the config file is loaded. This allows you to preload for example babel-register so you can use all babel presets you like.`,
  helpStyle: `By default, superorganism will dump a very long help documentation to the screen based on your package-scripts.js file. You can modify this output with one of three help-style options:

all gives you the normal default output:

\`\`\`
superorganism help "--help-style all"
\`\`\`

scripts will give you only the help information built from your package-scripts.js file

\`\`\`
superorganism help "--help-style scripts"
\`\`\`

basic will give you only the name and description of the scripts from your package-scripts.js file

\`\`\`
superorganism help "--help-style basic"
\`\`\`
`,
}
/* eslint-enable max-len */

export const CONFIG_DEFAULTS = {
  scripts: true,
  helpStyle: 'all',
}

export const HELP = generateHelp(pkg.name, HELP_CONFIG, YARGS_CONFIG)
