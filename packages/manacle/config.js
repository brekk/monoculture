export const CONFIG = {
  alias: {
    help: ['h'],
    color: ['k'],
    input: ['i'],
    query: ['q'],
    check: ['c'],
  },
  boolean: ['help', 'color'],
  array: ['check'],
  configuration: {
    'strip-aliased': true,
  },
}

export const CONFIG_DEFAULTS = {
  color: true,
  help: false,
}

/* eslint-disable max-len */
export const HELP_CONFIG = {
  help: `This text you're reading now!`,
  color: `Do stuff with glorious color`,
  input: `The path to a monocle-findings.json file.`,
  query: `Ask a question of the data`,
  check: `Provide a checkfile (Can be specified multiple times)`,
}
/* eslint-enable max-len */

export const BANNER = `     _     _
    ( \\._./ )
    _)  ●  (_
   /    ⟁    \\
  /  .-----.  \\
 /  /       \\  \\
(  (         )  )
 \\  \\_______/  /
  '-___|_____-'
`
