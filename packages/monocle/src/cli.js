import { resolve as pathResolve } from 'node:path'
import { pipe, chain, map } from 'ramda'
import { fork, parallel } from 'fluture'
import { interpret } from 'file-system'
import { monoprocessor } from './reader'
import { configurate } from 'configurate'
import PKG from '../package.json'
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
  chain(config => {
    const { basePath, plugin: plugins = [], _: dirGlob = [] } = config
    const pluginsF = pipe(
      map(x => pathResolve(basePath, x)),
      map(interpret),
      parallel(10)
    )(plugins)
    return monoprocessor(config, pluginsF, dirGlob[0])
  }),
  // eslint-disable-next-line no-console
  fork(console.warn)(console.log)
)(process.argv.slice(2))

// eslint-enable no-console
