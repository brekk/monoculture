import {
  __ as $,
  ifElse,
  always,
  pipe,
  mergeRight,
  curry,
  F as alwaysFalse,
} from 'ramda'
import { parse } from './parser'
import { generateHelp } from './help'
import { Future, reject, resolve } from 'fluture'
import { cosmiconfig } from 'cosmiconfig'
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
      boolean: !yargsConfig.boolean
        ? help
        : yargsConfig.boolean.includes('help')
        ? yargsConfig.boolean
        : yargsConfig.boolean.concat(help),
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

export const spaceconfig = curry((config, ns, loadPath) =>
  Future((bad, good) => {
    const explorer = cosmiconfig(ns, config)
    const toRun = loadPath ? explorer.load(loadPath) : explorer.search()
    toRun.catch(bad).then(good)
    return () => {}
  })
)
export const configFile = spaceconfig({})
export const configSearch = spaceconfig($, $, false)
