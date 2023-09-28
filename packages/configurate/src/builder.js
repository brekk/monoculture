import {
  ifElse,
  always,
  pipe,
  mergeRight,
  curry,
  F as alwaysFalse,
} from 'ramda'
import { parse } from './parser'
import { generateHelp } from './help'
import { reject, resolve } from 'fluture'
import { trace } from 'xtrace'

export const showHelpWhen = curry(
  (check, parsed) => parsed.help || check(parsed)
)

export const configurateWithOptions = curry(
  (
    { check = alwaysFalse },
    yargsConfig,
    configDefaults,
    helpConfig,
    name,
    argv
  ) => {
    const help = ['help']
    const updatedConfig = mergeRight(yargsConfig, {
      alias: mergeRight(yargsConfig.alias, { help: ['h'] }),
      boolean: yargsConfig.boolean
        ? yargsConfig.boolean.includes('help')
        : yargsConfig.boolean
        ? yargsConfig.boolean.concat(help)
        : help,
    })
    const HELP = generateHelp(name, helpConfig, updatedConfig)
    return pipe(
      parse(updatedConfig),
      mergeRight(configDefaults),
      ifElse(showHelpWhen(check), always(reject(HELP)), resolve)
    )(argv)
  }
)

export const configurate = configurateWithOptions({})
