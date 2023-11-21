import { Chalk } from 'chalk'
import {
  is,
  always as K,
  when,
  applySpec,
  __ as $,
  concat,
  curry,
  equals,
  ifElse,
  join,
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
      postscript: $postscript = '',
      name: $name,
      description: $desc = '',
      banner = '',
    } = $details
    const chalk = new Chalk({ level: showColor ? 2 : 0 })
    const doShowColor = K(showColor)
    const dynaBanner = banner && typeof banner === 'function'
    const $banner = dynaBanner ? banner(chalk) : banner
    const nameStyler = when(doShowColor, pipe(pad, chalk.inverse))
    return pipe(
      propOr({}, 'alias'),
      toPairs,
      map(([k, v]) =>
        pipe(
          applySpec({
            flags: pipe(
              x => [x],
              concat(v),
              map(
                pipe(
                  ifElse(pipe(length, equals(1)), shortFlag, longFlag),
                  chalk.green
                )
              ),
              join(' / ')
            ),
            description: pipe(
              propOr('???', $, helpConfig),
              failIfMissingFlag(process.env.NODE_ENV, k),
              when(is(Function), fn => fn(chalk))
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
        }\n\n${z}${$postscript ? '\n' + $postscript : ''}`
    )(yargsConfig)
  }
)
