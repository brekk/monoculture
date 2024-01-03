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

export const showHelpWhen = curry(function _showHelpWhen(check, parsed) {
  return parsed.help || check(parsed)
})

/**
 * Automatically create many of the fundamentals needed to build robust CLI tools,
 * including help text.
 * @name configurate
 * @future
 * @example
 * ```js test=true
 * import { fork } from 'fluture'
 * import stripAnsi from 'strip-ansi'
 * // drgen-import-above
 * const YARGS_CONFIG = {
 *   alias: {
 *     meal: ['m'],
 *     happyHour: ['h'],
 *     multiplier: ['x'],
 *   },
 *   boolean: ['happyHour'],
 *   number: ['multiplier'],
 *   configuration: {
 *     'strip-aliased': true,
 *   },
 * }
 *
 * const HELP_CONFIG = {
 *   help: 'This text!',
 *   // optional
 *   color: 'Render stuff in color',
 *   meal: 'Pass the name of the meal you want',
 *   happyHour: 'Does happy hour apply here?',
 *   multiplier: 'How many units should we apply?'
 * }
 *
 * const CONFIG_DEFAULTS = {
 *   color: true,
 *   happyHour: false
 * }
 *
 * const parseArgs = (args) => configurate(
 *   YARGS_CONFIG,
 *   // closured so that we can pass cwd at runtime
 *   {...CONFIG_DEFAULTS, cwd: process.cwd() },
 *   HELP_CONFIG,
 *   { name: "dumbwaiter", description: "order food!" },
 *   // process.argv.slice(2)
 *   args
 * )
 *
 * // renders in the failure channel
 * fork(x => {
 *   expect(stripAnsi(x).split('\n')).toEqual([
 *     " dumbwaiter ",
 *     "",
 *     "order food!",
 *     "",
 *     "  -m / --meal",
 *     "  	Pass the name of the meal you want",
 *     "",
 *     "  -h / --happyHour",
 *     "  	Does happy hour apply here?",
 *     "",
 *     "  -x / --multiplier",
 *     "  	How many units should we apply?",
 *     "",
 *     "  -h / --help",
 *     "  	This text!",
 *   ])
 *   done()
 * })(done)(
 *   parseArgs(['--help'])
 * )
 * ```
 */
export const configurate = curry(
  function _configurate(yargsConf, defaults, help, details, argv) {
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
  }
)

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
/**
 * The default search space when running `configFileWithCancel`.
 * @name defaultNameTemplate
 * @see {@link configFileWithCancel}
 * @example
 * ```js test=true
 * expect(defaultNameTemplate('cool')).toEqual(['.coolrc', '.coolrc.json'])
 * ```
 */
export const defaultNameTemplate = ns => [`.${ns}rc`, `.${ns}rc.json`]

export const configFileWithCancel = curry(
  function _configFileWithCancel(cancel, opts) {
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
  }
)

export const configFile = configFileWithCancel(NO_OP)
