import { resolve as pathResolve } from 'node:path'
import { pipe, chain, map } from 'ramda'
import { fork, parallel } from 'fluture'
import { interpret } from 'file-system'
import { monoprocessor } from './reader'
import { configurate } from 'configurate'
import PKG from '../package.json'
import { log } from './trace'
import { CONFIG, HELP_CONFIG, CONFIG_DEFAULTS } from './config'
// import { trace } from 'xtrace'

// eslint-disable no-console

pipe(
  configurate(
    CONFIG,
    { ...CONFIG_DEFAULTS, basePath: process.cwd() },
    HELP_CONFIG,
    PKG.name
  ),
  map(log.config('parsed')),
  chain(config => {
    const { basePath, plugin: plugins = [], _: dirGlob = [] } = config
    const pluginsF = pipe(
      map(
        pipe(log.plugin('loading'), x => pathResolve(basePath, x), interpret)
      ),
      parallel(10)
    )(plugins)
    return monoprocessor(config, pluginsF, dirGlob[0])
  }),
  // eslint-disable-next-line no-console
  fork(console.warn)(console.log)
)(process.argv.slice(2))

// eslint-enable no-console
