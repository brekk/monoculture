export const CONFIG = {
  alias: {
    help: ['h'],
    color: ['k'],
    input: ['i'],
    output: ['o'],
    basePath: ['b'],
  },
  configuration: {
    'strip-aliased': true,
  },
}

export const CONFIG_DEFAULTS = {
  color: true,
}

/* eslint-disable max-len */
export const HELP_CONFIG = {
  help: `This text you're reading now!`,
  color: `Do stuff with glorious color`,
  input: `Where to start building a bloodline`,
  output: `Where to write an output file`,
  basePath: `Process dependencies relative to this path.`,
}
/* eslint-enable max-len */
