import { Chalk } from 'chalk'
import {
  when,
  applySpec,
  __ as $,
  concat,
  curry,
  equals,
  ifElse,
  join,
  mergeRight,
  length,
  map,
  pipe,
  propOr,
  toPairs,
} from 'ramda'
import { trace } from 'xtrace'

// shortFlag :: String -> String
export const shortFlag = z => `-${z}`

// longFlag :: String -> String
export const longFlag = z => `--${z}`

// invalidHelpConfig :: String -> ()
export const invalidHelpConfig = key => {
  throw new Error(`You must add a "${key}" key to the helpConfig!`)
}

// failIfMissingFlag :: String -> String -> String
export const failIfMissingFlag = curry((env, k, raw) =>
  env !== 'production' && raw === '???' ? invalidHelpConfig(k) : raw
)

const pad = z => ` ${z} `

export const generateHelp = curry(
  (showColor, $details, helpConfig, yargsConfig) => {
    const {
      showName = true,
      banner: $banner = '',
      name: $name,
      description: $desc = '',
    } = $details
    const chalk = new Chalk({ level: showColor ? 2 : 0 })
    const nameStyler = when(() => showColor, pipe(pad, chalk.inverse))
    return pipe(
      propOr({}, 'alias'),
      toPairs,
      map(([k, v]) =>
        pipe(
          applySpec({
            flags: pipe(
              x => [x],
              concat(v),
              map(ifElse(pipe(length, equals(1)), shortFlag, longFlag)),
              map(chalk.green),
              join(' / ')
            ),
            description: pipe(
              propOr('???', $, helpConfig),
              failIfMissingFlag(process.env.NODE_ENV, k)
            ),
          }),
          ({ flags, description }) =>
            `  ${flags}\n  \t${description.replace(/\n/g, '\n  \t')}`
        )(k)
      ),
      join('\n\n'),
      z =>
        `${$banner ? $banner + '\n' : ''}${showName ? nameStyler($name) : ''}${
          $desc ? '\n\n' + $desc : ''
        }\n\n${z}`
    )(yargsConfig)
  }
)
