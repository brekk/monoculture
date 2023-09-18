// src/help.js
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
  of,
  pipe,
  prop,
  propOr,
  toPairs
} from "ramda";
var trace = curry((a, b) => {
  console.log(a, b);
  return b;
});
var shortFlag = (z) => `-${z}`;
var longFlag = (z) => `--${z}`;
var invalidHelpConfig = (key) => {
  throw new Error(`You must add a ${key} key to the helpConfig!`);
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
        (x) => [x],
        ap([
          pipe(
            (x) => [x],
            concat(v),
            map(ifElse(pipe(length, equals(1)), shortFlag, longFlag)),
            join(" / ")
          ),
          pipe(
            propOr("???", $, helpConfig),
            failIfMissingFlag(process.env.NODE_ENV, k)
          )
        ]),
        ([flags, description]) => `${flags}
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
