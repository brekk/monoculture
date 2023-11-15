import { chain, pipe, map, pathOr } from 'ramda'
import { configurate } from 'configurate'
import { interpret } from 'file-system'
import { log } from './trace'

import PKG from '../package.json'
import { YARGS_CONFIG, HELP_CONFIG, CONFIG_DEFAULTS } from './config'

export const runner = argv =>
  pipe(
    configurate(
      YARGS_CONFIG,
      { ...CONFIG_DEFAULTS, basePath: process.cwd() },
      HELP_CONFIG,
      PKG.name
    ),
    chain(
      ({
        basePath,
        config: source = `${basePath}/package-scripts.mjs`,
        ...parsedConfig
      }) =>
        pipe(
          log.config('importing...'),
          interpret,
          map(
            pipe(
              pathOr({}, ['default', 'scripts']),
              log.config('scripts'),
              loadedScripts => ({
                config: parsedConfig,
                scripts: loadedScripts,
                source,
              })
            )
          )
        )(source)
    )
  )(argv)
