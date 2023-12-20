import { resolve as pathResolve, dirname } from 'node:path'
import { Chalk } from 'chalk'
import {
  uniqBy,
  identity as I,
  curry,
  mergeRight,
  always as K,
  pipe,
  chain,
  map,
  length,
} from 'ramda'
import { reject, fork, parallel, resolve } from 'fluture'
import { interpret, writeFile } from 'file-system'
import { monoprocessor } from './reader'
import { configurate, configFileWithCancel } from 'climate'
import PKG from '../package.json'
import { log } from './trace'
import { CONFIG, HELP_CONFIG, CONFIG_DEFAULTS } from './config'
import pluginTOML from 'climate-toml'
import pluginJSON from 'climate-json'

const j = i => x => JSON.stringify(x, null, i)
// const readConfigFile = configFile('monocle')
// eslint-disable no-console

const cli = curry((cancel, args) =>
  pipe(
    configurate(
      CONFIG,
      { ...CONFIG_DEFAULTS, basePath: process.cwd(), cwd: process.cwd() },
      HELP_CONFIG,
      { name: PKG.name, description: PKG.description }
    ),
    map(log.config('raw config')),
    chain(config => {
      const result = config.rulefile
        ? pipe(
            configFileWithCancel(cancel),
            map(
              pipe(log.config('loaded rulefile'), mergeRight(config), raw => {
                return {
                  ...raw,
                  ignore: uniqBy(I, [
                    ...(raw?.ignore ?? []),
                    ...(config.ignore ?? []),
                  ]),
                  basePath: pathResolve(raw.basePath, dirname(config.rulefile)),
                }
              })
            )
          )({
            transformer: [pluginTOML, pluginJSON],
            source: config.rulefile,
            ns: 'monocle',
          })
        : resolve(config)
      return result
    }),
    map(log.config('parsed')),
    chain(config => {
      const chalk = new Chalk({ level: config.color ? 2 : 0 })
      const plugins = config.plugin?.length
        ? config.plugin
        : config.plugins?.length
        ? config.plugins
        : []
      const { basePath, _: dirGlob = [] } = config
      const [startGlob = false] = dirGlob
      if (!startGlob) {
        const argv = args.join(' ')
        return reject(
          `Please specify a searchspace (e.g. ${chalk.green(
            `\`monocle ${argv} "src/**/*"\``
          )})`
        )
      }
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
  )(args)
)

cli(() => {}, process.argv.slice(2))

// eslint-enable no-console
