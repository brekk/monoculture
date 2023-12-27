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
import { digUpWithCancel, readFileWithCancel } from 'file-system'

export const NO_OP = () => {}

export const showHelpWhen = curry(
  (check, parsed) => parsed.help || check(parsed)
)

/**
 * Automatically create many of the fundamentals needed to build robust CLI tools,
 * including help text.
 * @name configurate
 * @example
 * ```js
 * const YARGS_CONFIG = {
 *   alias: {
 *     readme: ['r'],
 *     showDeps: ['s'],
 *     drGenPath: ['d'],
 *   },
 *   boolean: ['readme', 'showDeps'],
 *   configuration: {
 *     'strip-aliased': true,
 *   },
 * }
 *
 * const HELP_CONFIG = {
 *   help: 'This text!',
 *   color: 'Render stuff in color',
 *   readme: 'Generate content for a readme (in markdown!)',
 *   showDeps: 'Add dependency information (not applicable in all cases)',
 * }
 *
 * const CONFIG_DEFAULTS = {
 *   readme: false,
 *   showDeps: false,
 *   color: true,
 * }
 *
 * const parseArgs = (args) => configurate(
 *   YARGS_CONFIG,
 *   CONFIG_DEFAULTS,
 *   HELP_CONFIG,
 *   {cwd: process.cwd()},
 *   // process.argv.slice(2)
 *   ['--readme']
 * )
 * // { readme: true, showDeps: false, color: true, HELP: `/* [...] *\/` }
 * ```
 */
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
    digUp: digUpOpts = {},
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
      digUpWithCancel(cancel, digUpOpts),
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
