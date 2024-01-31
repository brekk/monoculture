import { cwd } from 'node:process'
import { interpret } from 'file-system'
import { configurate } from 'climate'
import { map, chain, curry, pipe, slice } from 'ramda'
import { resolve } from 'fluture'
import { drgen } from 'doctor-general'
import { signal } from 'kiddo'

import PKG from './package.json'
import { HELP_CONFIG, YARGS_CONFIG, CONFIG_DEFAULTS } from './config'
import { log } from './log'

const processHelpOrRun = curry(function _processHelpOrRun(cancel, config) {
  const { HELP, help, input, output, interpreter } = config
  if (help || !input || !output) {
    return resolve(HELP)
  }
  return pipe(
    interpret,
    signal(cancel, {
      text: `Loading interpreter: ${interpreter}...`,
      successText: `Loaded interpreter: ${interpreter}...`,
      failText: `Unable to load interpreter: ${interpreter}`,
    }),
    log.cli('interpreter'),
    chain(p =>
      drgen(cancel, {
        ...config,
        interpreter: p,
      })
    )
  )(interpreter)
})

const { name: $NAME, description: $DESC } = PKG
export const cli = curry(function _cli(cancel, argv) {
  return pipe(
    slice(2, Infinity),
    configurate(YARGS_CONFIG, { ...CONFIG_DEFAULTS, cwd: cwd() }, HELP_CONFIG, {
      name: $NAME,
      description: $DESC,
    }),
    chain(processHelpOrRun(cancel)),
    map(log.cli('out!'))
  )(argv)
})
