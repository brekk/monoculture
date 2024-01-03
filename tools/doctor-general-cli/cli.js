import PKG from './package.json'
import { interpret } from 'file-system'
import { configurate } from 'climate'
import { chain, curry, pipe, slice } from 'ramda'
import { resolve } from 'fluture'
import { drgen } from 'doctor-general'

import { HELP_CONFIG, YARGS_CONFIG, CONFIG_DEFAULTS } from './config'

const processHelpOrRun = config => {
  const { HELP, help, input, output, processor } = config
  if (help || !input || !output) {
    return resolve(HELP)
  }
  return pipe(
    interpret,
    chain(p =>
      drgen({
        ...config,
        processor: p,
      })
    )
  )(processor)
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
