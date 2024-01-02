import PKG from './package.json'
import { configurate } from 'climate'
import { chain, curry, pipe, slice } from 'ramda'
import { resolve } from 'fluture'
import { drgen } from 'doctor-general'

import { HELP_CONFIG, YARGS_CONFIG, CONFIG_DEFAULTS } from './config'

const processHelpOrRun = config => {
  return config.help || !config.input || !config.output
    ? resolve(config.HELP)
    : drgen(config)
}

const { name: $NAME, description: $DESC } = PKG
export const cli = curry(function _cli(cancel, argv) {
  return pipe(
    slice(2, Infinity),
    configurate(YARGS_CONFIG, CONFIG_DEFAULTS, HELP_CONFIG, {
      name: $NAME,
      description: $DESC,
    }),
    chain(processHelpOrRun)
  )(argv)
})
