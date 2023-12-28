// import { argv } from 'node:process'
import { configurate } from 'climate'
import { fork } from 'fluture'
import { pipe, curry, chain } from 'ramda'
import { CONFIG_DEFAULTS, CONFIG, HELP_CONFIG } from './config'
import { bloodlineWithCancel } from './bloodline'
import PKG from './package.json'

export const cli = curry((cancel, args) =>
  pipe(
    configurate(
      CONFIG,
      { cwd: process.cwd(), ...CONFIG_DEFAULTS },
      HELP_CONFIG,
      {
        name: PKG.name,
        description: PKG.description,
      }
    ),
    chain(bloodlineWithCancel(cancel))
  )(args)
)

// eslint-disable-next-line no-console
fork(console.warn)(console.log)(cli(() => {}, process.argv.slice(2)))
