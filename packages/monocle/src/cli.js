import { resolve as pathResolve } from 'node:path'
import { always as K, pipe, chain, map, length } from 'ramda'
import { fork, parallel, resolve } from 'fluture'
import { interpret, writeFile } from 'file-system'
import { monoprocessor } from './reader'
import { configurate, configFile } from 'configurate'
import PKG from '../package.json'
import { log } from './trace'
import { CONFIG, HELP_CONFIG, CONFIG_DEFAULTS } from './config'

const j = i => x => JSON.stringify(x, null, i)
const readConfigFile = configFile('monocle')
// eslint-disable no-console

pipe(
  configurate(
    CONFIG,
    { ...CONFIG_DEFAULTS, basePath: process.cwd() },
    HELP_CONFIG,
    PKG.name
  ),
  chain(config => {
    const result = config.rulefile
      ? pipe(
          readConfigFile,
          map(read => ({ ...config, ...read.config }))
        )(config.rulefile)
      : // TODO we should eschew chain(Future(x))
        resolve(config)
    return result
  }),
  map(log.config('parsed')),
  chain(config => {
    const plugins = config.plugin || config.plugins || []
    const { basePath, _: dirGlob = [] } = config
    log.plugin('plugins...', plugins)

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
