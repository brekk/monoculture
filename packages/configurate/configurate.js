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
import { cosmiconfig } from "cosmiconfig";
import { trace as trace2 } from "xtrace";
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
var spaceconfig = curry3(
  (config, ns, loadPath) => Future((bad, good) => {
    const explorer = cosmiconfig(ns, config);
    const toRun = loadPath ? explorer.load(loadPath) : explorer.search();
    toRun.catch(bad).then(good);
    return () => {
    };
  })
);
var configFile = spaceconfig({});
var configSearch = spaceconfig($2, $2, false);
export {
  configFile,
  configSearch,
  configurate,
  configurateWithOptions,
  failIfMissingFlag,
  generateHelp,
  invalidHelpConfig,
  longFlag,
  shortFlag,
  showHelpWhen,
  spaceconfig
};
