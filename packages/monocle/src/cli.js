import { pipe, chain, map } from 'ramda'
import { fork } from 'fluture'
import { monoprocessor } from './reader'
import { configurate } from 'configurate'
import PKG from '../package.json'
import { CONFIG, HELP_CONFIG, CONFIG_DEFAULTS } from './config'
import { trace } from 'xtrace'

// eslint-disable no-console

pipe(
  trace('input!'),
  x =>
    configurate(
      CONFIG,
      { ...CONFIG_DEFAULTS, basePath: process.cwd() },
      HELP_CONFIG,
      PKG.name,
      x
    ),
  trace('raw'),
  chain(config => {
    trace('parsed', config)
    const { plugins = [], _: dirGlob } = config
    return monoprocessor(config, plugins, dirGlob)
  }),
  // eslint-disable-next-line no-console
  fork(console.warn)(console.log)
)(process.argv.slice(2))

// eslint-enable no-console
