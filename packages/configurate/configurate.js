// src/help.js
import {
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
            failIfMissingFlag("development", k)
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

// src/builder.js
import {
  map as map2,
  identity as I,
  __ as $2,
  ifElse as ifElse2,
  always,
  pipe as pipe2,
  mergeRight as mergeRight2,
  curry as curry3,
  F as alwaysFalse
} from "ramda";

// src/parser.js
import { curry as curry2 } from "ramda";
import yargsParser from "yargs-parser";
var parse = curry2((opts, args) => yargsParser(args, opts));

// src/builder.js
import { Future, reject, resolve } from "fluture";
import { readFileWithCancel } from "file-system";
import { trace as trace2 } from "xtrace";
import { findUp as __findUp } from "find-up";
var NO_OP = () => {
};
var showHelpWhen = curry3(
  (check, parsed) => parsed.help || check(parsed)
);
var configurateWithOptions = curry3(
  ({ check = alwaysFalse }, yargsConfig, configDefaults, helpConfig, name, argv) => {
    const help = ["help"];
    const updatedConfig = mergeRight2(yargsConfig, {
      alias: mergeRight2(yargsConfig.alias, { help: ["h"] }),
      boolean: !yargsConfig.boolean ? help : yargsConfig.boolean.includes("help") ? yargsConfig.boolean : yargsConfig.boolean.concat(help)
    });
    const HELP = generateHelp(name, helpConfig, updatedConfig);
    return pipe2(
      parse(updatedConfig),
      mergeRight2(configDefaults),
      ifElse2(showHelpWhen(check), always(reject(HELP)), resolve)
    )(argv);
  }
);
var configurate = configurateWithOptions({});
var findUpWithCancel = curry3(
  (cancel, opts, x) => Future((bad, good) => {
    __findUp(x, opts).catch(bad).then(good);
    return cancel;
  })
);
var findUp = findUpWithCancel(NO_OP);
var defaultNameTemplate = (ns) => [`.${ns}rc`, `.${ns}rc.json`];
var configFileWithOptionsAndCancel = curry3((cancel, opts) => {
  if (typeof opts === "string") {
    return readFileWithCancel(cancel, opts);
  }
  const {
    ns = "configurate",
    wrapTransformer = true,
    json = false,
    template = defaultNameTemplate,
    transformer = json ? JSON.parse : I
  } = opts;
  const finder = findUpWithCancel(cancel);
  const searchspace = template(ns);
  const lookupF = finder(searchspace);
  const transform = wrapTransformer ? map2(transformer) : transformer;
  return pipe2(transform)(lookupF);
});
var configFile = configFileWithOptionsAndCancel(NO_OP);
export {
  configFile,
  configFileWithOptionsAndCancel,
  configurate,
  configurateWithOptions,
  defaultNameTemplate,
  failIfMissingFlag,
  findUp,
  findUpWithCancel,
  generateHelp,
  invalidHelpConfig,
  longFlag,
  shortFlag,
  showHelpWhen
};
