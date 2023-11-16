import {
  chain,
  map,
  identity as I,
  ifElse,
  pipe,
  mergeRight,
  curry,
  F as alwaysFalse,
} from 'ramda'
import { parse } from './parser'
import { generateHelp } from './help'
import { Future, reject, resolve } from 'fluture'
import { readFileWithCancel } from 'file-system'
import { findUp as __findUp } from 'find-up'

export const NO_OP = () => {}

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
    return pipe(
      parse(updatedConfig),
      raw => {
        const merged = { ...configDefaults, ...raw }
        const HELP = generateHelp(
          merged.color || false,
          name,
          helpConfig,
          updatedConfig
        )
        return { ...merged, HELP }
      },
      ifElse(showHelpWhen(check), x => reject(x.HELP), resolve)
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
  let refF
  const optString = typeof opts === 'string'
  if (optString || opts.source) {
    refF = readFileWithCancel(cancel, opts.source || opts)
  }
  const defOpts = !optString ? opts : {}
  const {
    findUp: findUpOpts,
    ns = 'configurate',
    wrapTransformer = true,
    json = true,
    template = defaultNameTemplate,
    transformer = json ? JSON.parse : I,
  } = defOpts
  const finder = findUpWithCancel(cancel, findUpOpts)
  const searchspace = template(ns)
  if (!refF) {
    refF = pipe(finder, chain(readFileWithCancel(cancel)))(searchspace)
  }
  const transform = wrapTransformer ? map(transformer) : transformer

  return pipe(transform)(refF)
})

export const configFile = configFileWithOptionsAndCancel(NO_OP)
