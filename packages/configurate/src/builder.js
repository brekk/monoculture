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
  (check, parsed) => check(parsed) || parsed.help
)

export const configurateWithOptions = curry(
  (
    { check = alwaysFalse, options = {} },
    yargsConfig,
    configDefaults,
    helpConfig,
    name,
    argv
  ) => {
    const HELP = generateHelp(name, helpConfig, yargsConfig)
    return pipe(
      parse(options),
      mergeRight(configDefaults),
      trace('parsed'),
      ifElse(showHelpWhen(check), always(reject(HELP)), resolve)
    )(argv)
  }
)

export const configurate = configurateWithOptions({})
