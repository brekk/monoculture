import {
  curry,
  pipe,
  prop,
  toPairs,
  map,
  of,
  ap,
  pipe,
  concat,
  map,
  length,
  ifElse,
  equals,
  join,
} from 'ramda'

export const generateHelp = curry((name, yargsConfig) =>
  pipe(
    prop('alias'),
    toPairs,
    map(([k, v]) =>
      pipe(
        of,
        ap([
          pipe(
            of,
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
    z => `${name}\n\n${z}`
  )(yargsConfig)
)

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
