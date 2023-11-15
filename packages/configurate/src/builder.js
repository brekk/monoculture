import {
  map,
  identity as I,
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
import { readFileWithCancel } from 'file-system'
import { trace } from 'xtrace'
import { findUp as __findUp } from 'find-up'

const NO_OP = () => {}

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

export const findUpWithCancel = curry((cancel, opts, x) =>
  Future((bad, good) => {
    __findUp(x, opts).catch(bad).then(good)
    return cancel
  })
)
export const findUp = findUpWithCancel(NO_OP)
export const defaultNameTemplate = ns => [`.${ns}rc`, `.${ns}rc.json`]

export const configFileWithOptionsAndCancel = curry((cancel, opts) => {
  if (typeof opts === 'string') {
    return readFileWithCancel(cancel, opts)
  }

  const {
    ns = 'configurate',
    wrapTransformer = true,
    json = false,
    template = defaultNameTemplate,
    transformer = json ? JSON.parse : I,
  } = opts

  const finder = findUpWithCancel(cancel)
  const searchspace = template(ns)
  const lookupF = finder(searchspace)
  const transform = wrapTransformer ? map(transformer) : transformer
  return pipe(transform)(lookupF)
})

export const configFile = configFileWithOptionsAndCancel(NO_OP)

/*

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

*/
