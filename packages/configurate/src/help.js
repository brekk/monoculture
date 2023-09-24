import {
  __ as $,
  ap,
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

// shortFlag :: String -> String
export const shortFlag = z => `-${z}`

// longFlag :: String -> String
export const longFlag = z => `--${z}`

// invalidHelpConfig :: String -> ()
export const invalidHelpConfig = key => {
  throw new Error(`You must add a ${key} key to the helpConfig!`)
}

// failIfMissingFlag :: String -> String -> String
export const failIfMissingFlag = curry((env, k, raw) =>
  env !== 'production' && raw === '???' ? invalidHelpConfig(k) : raw
)

export const generateHelp = curry((name, helpConfig, yargsConfig) =>
  pipe(
    propOr({}, 'alias'),
    toPairs,
    map(([k, v]) =>
      pipe(
        x => [x],
        ap([
          pipe(
            x => [x],
            concat(v),
            map(ifElse(pipe(length, equals(1)), shortFlag, longFlag)),
            join(' / ')
          ),
          pipe(
            propOr('???', $, helpConfig),
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
