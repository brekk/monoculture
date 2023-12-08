import {
  cond,
  chain,
  map,
  identity as I,
  ifElse,
  pipe,
  mergeRight,
  curry,
  F as alwaysFalse,
} from 'ramda'
import { log } from './log'
import { parse as parseArgs } from './parser'
import { generateHelp } from './help'
import { reject, resolve, coalesce } from 'fluture'
import { findUpWithCancel, readFileWithCancel } from 'file-system'

export const NO_OP = () => {}

export const showHelpWhen = curry(
  (check, parsed) => parsed.help || check(parsed)
)

export const configurate = curry((yargsConf, defaults, help, details, argv) => {
  const $help = ['help']
  const { boolean: $yaBool } = yargsConf
  const updatedConfig = mergeRight(yargsConf, {
    alias: mergeRight(yargsConf.alias, { help: ['h'] }),
    boolean: !$yaBool
      ? $help
      : $yaBool.includes('help')
      ? $yaBool
      : $yaBool.concat(help),
  })
  const { check = alwaysFalse } = details
  return pipe(
    parseArgs(updatedConfig),
    raw => {
      const merged = { ...defaults, ...raw }
      const HELP = generateHelp(
        merged.color || false,
        details,
        help,
        updatedConfig
      )
      return { ...merged, HELP }
    },
    ifElse(showHelpWhen(check), x => reject(x.HELP), resolve)
  )(argv)
})

export const pluginToCondMap = ({ name, test, parse }) => {
  if (!name || !test || !parse) {
    throw new Error(
      `This plugin (${
        name || 'unknown'
      }) is not valid ({ test: ${test}, parse: ${parse} }).`
    )
  }
  return [
    pipe(test, log.plugin(name + ':test')),
    pipe(parse, log.plugin(name + ':read')),
  ]
}

export const defaultNameTemplate = ns => [`.${ns}rc`, `.${ns}rc.json`]

export const configFileWithCancel = curry((cancel, opts) => {
  let refF
  const optString = typeof opts === 'string'
  if (optString || opts.source) {
    const source = opts.source || opts
    log.builder(`loading directly!`, source)
    refF = readFileWithCancel(cancel, source)
  }
  const defOpts = !optString ? opts : {}
  const {
    findUp: findUpOpts = {},
    ns = 'climate',
    wrapTransformer = true,
    json = false,
    template = defaultNameTemplate,
    transformer = json ? JSON.parse : I,
    optional = false,
  } = defOpts
  const searchspace = template(ns)
  if (!refF) {
    log.builder(`looking in...`, searchspace)
    refF = pipe(
      findUpWithCancel(cancel, findUpOpts),
      chain(readFileWithCancel(cancel)),
      optional && json
        ? pipe(
            coalesce(() => ({ source: 'No config found!' }))(I),
            map(JSON.stringify),
            map(log.builder('...hey how?'))
          )
        : I
    )(searchspace)
  }
  const chrysalis = Array.isArray(transformer)
    ? cond(map(pluginToCondMap)(transformer))
    : transformer
  const transform = wrapTransformer ? map(chrysalis) : chrysalis
  return pipe(transform)(refF)
})

export const configFile = configFileWithCancel(NO_OP)
