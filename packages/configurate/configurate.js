// src/help.js
import {
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
  toPairs
} from "ramda";
import { trace } from "xtrace";
var shortFlag = (z) => `-${z}`;
var longFlag = (z) => `--${z}`;
var invalidHelpConfig = (key) => {
  throw new Error(`You must add a "${key}" key to the helpConfig!`);
};
var failIfMissingFlag = curry(
  (env, k, raw) => env !== "production" && raw === "???" ? invalidHelpConfig(k) : raw
);
var generateHelp = curry(
  (name, helpConfig, yargsConfig) => pipe(
    propOr({}, "alias"),
    toPairs,
    map(
      ([k, v]) => pipe(
        applySpec({
          flags: pipe(
            (x) => [x],
            concat(v),
            map(ifElse(pipe(length, equals(1)), shortFlag, longFlag)),
            join(" / ")
          ),
          description: pipe(
            propOr("???", $, helpConfig),
            failIfMissingFlag(process.env.NODE_ENV, k)
          )
        }),
        ({ flags, description }) => `${flags}
  ${description}`
      )(k)
    ),
    join("\n\n"),
    (z) => `${name}

${z}`
  )(yargsConfig)
);
export {
  failIfMissingFlag,
  generateHelp,
  invalidHelpConfig,
  longFlag,
  shortFlag
};
