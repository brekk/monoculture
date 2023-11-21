import path from 'node:path'
import { configFileWithCancel, configurate } from 'climate'
import { Chalk } from 'chalk'
import { mapRej, resolve } from 'fluture'
import { writeFileWithConfigAndCancel } from 'file-system'
import { ifElse, curry, map, chain, pipe } from 'ramda'
import {
  DEFAULT_CONFIG_FILE,
  MAKE_A_GITPARTYRC_FILE,
  YARGS_CONFIG,
  CONFIG_DEFAULTS,
  HELP_CONFIG,
} from './config'
import PKG from '../package.json'

const { name: $NAME, description: $DESC } = PKG
export const runner = curry((cancel, argv) =>
  pipe(
    configurate(
      YARGS_CONFIG,
      { ...CONFIG_DEFAULTS, repo: process.cwd(), cwd: process.cwd() },
      HELP_CONFIG,
      {
        name: $NAME,
        description: $DESC,
      }
    ),
    chain($config => {
      const { cwd, color: useColor, config, help, HELP, init } = $config
      if (init) {
        const filepath = path.resolve(cwd, '.gitpartyrc')
        return pipe(
          writeFileWithConfigAndCancel(cancel, { encoding: 'utf8' }, filepath),
          map(() => `Wrote file to "${filepath}"!`)
        )(JSON.stringify(DEFAULT_CONFIG_FILE, null, 2))
      }
      const chalk = new Chalk({ level: useColor ? 2 : 0 })
      return pipe(
        ifElse(
          () => help,
          () => resolve(HELP),
          pipe(
            configFileWithCancel(cancel),
            mapRej(e =>
              e?.message?.includes('No config file found')
                ? MAKE_A_GITPARTYRC_FILE(chalk)
                : e
            )
          )
        )
      )(
        config
          ? config
          : {
              ns: PKG.name,
            }
      )
    })
  )(argv)
)
