import { resolve as pathResolve } from 'node:path'
import { always as K, pipe, chain, map, length, identity as I } from 'ramda'
import { fork, parallel, resolve } from 'fluture'
import { interpret, writeFile } from 'file-system'
import { monoprocessor } from './reader'
import { configurate } from 'configurate'
import PKG from '../package.json'
import { log } from './trace'
import { CONFIG, HELP_CONFIG, CONFIG_DEFAULTS } from './config'
// import { trace } from 'xtrace'

const j = i => x => JSON.stringify(x, null, i)

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
    if (config.showTotalMatchesOnly) config.showMatchesOnly = true
    const pluginsF = pipe(
      map(
        pipe(log.plugin('loading'), x => pathResolve(basePath, x), interpret)
      ),
      parallel(10)
    )(plugins)
    return pipe(
      monoprocessor(config, pluginsF),
      map(z => [config, z])
    )(dirGlob[0])
  }),
  chain(
    ([{ showMatchesOnly, showTotalMatchesOnly, jsonIndent, output }, body]) =>
      pipe(
        showMatchesOnly
          ? // later we should make this less clunky (re-wrapping futures)
            pipe(showTotalMatchesOnly ? length : j(jsonIndent), resolve)
          : pipe(
              j(jsonIndent),
              writeFile(output),
              map(K(`Wrote file to ${output}`))
            )
      )(body)
  ),
  // eslint-disable-next-line no-console
  fork(console.warn)(console.log)
)(process.argv.slice(2))

// eslint-enable no-console
