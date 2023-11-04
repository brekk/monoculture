import {
  __ as $,
  propOr,
  ap,
  concat,
  curry,
  equals,
  filter,
  identity as I,
  ifElse,
  join,
  map,
  mergeRight,
  objOf,
  of,
  pipe,
  prop,
  reduce,
  length,
  toPairs,
} from 'ramda'
import H from 'chalk'
import { trace } from './trace'

export const LOGO = `   /\\/\\
 .======.
<dIIIIIIb>
 |[${H.red('o')}><${H.red('o')}]| 
 ${H.cyan('(||||||)')}
 |______|
`

// TODO: use `configurate`
export const CONFIG = {
  alias: {
    help: ['h'],
    fun: ['f'],
    limit: ['l'],
    ignore: ['i'],
    ignoreTokens: ['t'],
    skipWords: ['w'],
    dropStrings: ['s'],
    histogramMinimum: ['hits', 'm'],
    assumeSimilarWords: ['similar', 'a'],
    dropJSKeywords: ['j'],
    dropTSKeywords: ['J'],
  },
  array: ['skipWords', 'ignoreTokens', 'ignore'],
  boolean: [
    'dropStrings',
    'assumeSimilarWords',
    'dropJSKeywords',
    'dropTSKeywords',
    'fun',
  ],
  number: ['histogramMinimum'],
  configuration: { 'strip-aliased': true },
}

export const CERTAIN_COMMON_WORDS = ['use', 'get', 'id']
export const USER_DEFINED_VALUES = ['useSWR']

export const DEFAULT_CONFIG = {
  help: false,
  fun: true,
  limit: Infinity,
  skipWords: [],
  ignore: USER_DEFINED_VALUES,
  ignoreTokens: CERTAIN_COMMON_WORDS,
  dropStrings: true,
  histogramMinimum: 1,
  assumeSimilarWords: true,
  dropJSKeywords: true,
  dropTSKeywords: true,
}

export const HELP_CONFIG = {
  help: 'This text!',
  fun: 'Show the robot',
  limit: 'What top number of words do you want to see? (default: Infinity)',
  skipWords: 'Ignore a given word (this should be merged with --ignore)',
  ignore: 'Ignore a matched string (can be specified multiple times)',
  ignoreTokens:
    'Ignore a token once it is processed (more reliable than `--ignore`)',
  dropStrings: 'Should strings be retained or removed?',
  histogramMinimum: 'What is the minimum number of matches as a threshold?',
  assumeSimilarWords: 'Should we attempt to infer whether words are similar?',
  dropJSKeywords: 'Should JS keywords be dropped? (default: true)',
  dropTSKeywords: 'Should TS keywords be dropped? (default: true)',
}

export const supplantYargsParsery = raw =>
  pipe(
    toPairs,
    reduce(
      (agg, [k, alt]) =>
        pipe(
          map(key => prop(key, agg)),
          filter(I),
          map(objOf(k)),
          reduce(mergeRight, {}),
          mergeRight(agg)
        )(alt),
      raw
    )
  )(CONFIG.alias)

// shortFlag :: String -> String
const shortFlag = z => `-${z}`

// longFlag :: String -> String
const longFlag = z => `--${z}`

// invalidHelpConfig :: String -> ()
export const invalidHelpConfig = key => {
  throw new Error(`You must add a ${key} key to HELP_CONFIG!`)
}

// failIfMissingFlag :: String -> String -> String
export const failIfMissingFlag = curry((env, k, raw) =>
  env !== 'production' && raw === '???' ? invalidHelpConfig(k) : raw
)

// HELP :: Config -> String
export const HELP = pipe(
  propOr({}, 'alias'),
  toPairs,
  map(([k, v]) =>
    pipe(
      z => [z],
      ap([
        pipe(
          z => [z],
          concat(v),
          map(ifElse(pipe(length, equals(1)), shortFlag, longFlag)),
          join(' / ')
        ),
        pipe(
          propOr('???', $, HELP_CONFIG),
          failIfMissingFlag(process.env.NODE_ENV, k)
        ),
      ]),
      ([flags, description]) => `${flags}\n  ${description}`
    )(k)
  ),
  join('\n\n'),
  z => `robot-tourist\n${LOGO}\n${z}`
)(CONFIG)
