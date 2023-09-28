import { pipe, chain, map } from 'ramda'
import { fork } from 'fluture'
import { monoprocessor } from './reader'
import { configurate } from 'configurate'
import PKG from '../package.json'
import { CONFIG, HELP_CONFIG, CONFIG_DEFAULTS } from './config'
import { trace } from 'xtrace'

// eslint-disable no-console

pipe(
  configurate(
    CONFIG,
    { ...CONFIG_DEFAULTS, basePath: process.cwd() },
    HELP_CONFIG,
    PKG.name
  ),
  chain(config => {
    const { plugins = [], _: dirGlob = [] } = config
    trace('parsed', JSON.stringify(config, null, 2))
    return monoprocessor(config, plugins, dirGlob[0])
  }),
  // eslint-disable-next-line no-console
  fork(console.warn)(console.log)
)(process.argv.slice(2))

// eslint-enable no-console
