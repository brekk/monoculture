import { resolve as pathResolve } from 'node:path'
import { curry, pipe, chain, map } from 'ramda'
import { fork, parallel } from 'fluture'
import { interpret, readFileWithCancel } from 'file-system'
import { configurate } from 'climate'
import PKG from './package.json'
import { log } from './log'
import { CONFIG, HELP_CONFIG, CONFIG_DEFAULTS } from './config'

const cli = curry(function _cli(cancel, args) {
  return pipe(
    configurate(
      CONFIG,
      { ...CONFIG_DEFAULTS, basePath: process.cwd(), cwd: process.cwd() },
      HELP_CONFIG,
      { name: PKG.name, description: PKG.description }
    ),
    // signal(cancel, {text: 'Processing configuration...',
    // successText: 'Configured!', failText: 'Unable to configure.'}),
    chain(config => {
      const { input, check, cwd } = config
      const readRel = x =>
        pipe(y => pathResolve(cwd, y), readFileWithCancel(cancel))(x)
      const checks = map(pipe(readRel, interpret), check)
      const findings = pipe(readRel, map(JSON.parse))(input)

      const allFiles = [findings, ...checks]

      return pipe(map(log.cli('all files')), parallel(10))(allFiles)
    })
  )(args)
})

// eslint-disable-next-line no-console
fork(console.warn)(console.log)(cli(() => {}, process.argv.slice(2)))

// eslint-enable no-console
