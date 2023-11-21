// src/help.js
import { Chalk } from "chalk";
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
var pad = (z) => ` ${z} `;
var generateHelp = curry(
  (showColor, $details, helpConfig, yargsConfig) => {
    const {
      showName = true,
      postscript: $postscript = "",
      name: $name,
      description: $desc = "",
      banner = ""
    } = $details;
    const chalk = new Chalk({ level: showColor ? 2 : 0 });
    const doShowColor = K(showColor);
    const dynaBanner = banner && typeof banner === "function";
    const $banner = dynaBanner ? banner(chalk) : banner;
    const nameStyler = when(doShowColor, pipe(pad, chalk.inverse));
    return pipe(
      propOr({}, "alias"),
      toPairs,
      map(
        ([k, v]) => pipe(
          applySpec({
            flags: pipe(
              (x) => [x],
              concat(v),
              map(
                pipe(
                  ifElse(pipe(length, equals(1)), shortFlag, longFlag),
                  chalk.green
                )
              ),
              join(" / ")
            ),
            description: pipe(
              propOr("???", $, helpConfig),
              failIfMissingFlag("development", k),
              when(is(Function), (fn) => fn(chalk))
            )
          }),
          ({ flags, description }) => `  ${flags}
  	${description.replace(/\n/g, "\n  	")}`
        )(k)
      ),
      join("\n\n"),
      (z) => `${$banner ? $banner + "\n" : ""}${showName ? nameStyler($name) : ""}${$desc ? "\n\n" + $desc : ""}

${z}${$postscript ? "\n" + $postscript : ""}`
    )(yargsConfig);
  }
);

// src/builder.js
import {
  chain,
  map as map2,
  identity as I,
  ifElse as ifElse2,
  pipe as pipe2,
  mergeRight,
  curry as curry3,
  F as alwaysFalse
} from "ramda";

// src/log.js
import { complextrace } from "envtrace";
var log = complextrace("climate", ["help", "builder", "info"]);

// src/parser.js
import { curry as curry2 } from "ramda";
import yargsParser from "yargs-parser";
var parse = curry2((opts, args) => yargsParser(args, opts));

// src/builder.js
import { reject, resolve, coalesce } from "fluture";
import { findUpWithCancel, readFileWithCancel } from "file-system";
var NO_OP = () => {
};
var showHelpWhen = curry3(
  (check, parsed) => parsed.help || check(parsed)
);
var configurate = curry3((yargsConf, defaults, help, details, argv) => {
  const $help = ["help"];
  const { boolean: $yaBool } = yargsConf;
  const updatedConfig = mergeRight(yargsConf, {
    alias: mergeRight(yargsConf.alias, { help: ["h"] }),
    boolean: !$yaBool ? $help : $yaBool.includes("help") ? $yaBool : $yaBool.concat(help)
  });
  const { check = alwaysFalse } = details;
  return pipe2(
    parse(updatedConfig),
    (raw) => {
      const merged = { ...defaults, ...raw };
      const HELP = generateHelp(
        merged.color || false,
        details,
        help,
        updatedConfig
      );
      return { ...merged, HELP };
    },
    ifElse2(showHelpWhen(check), (x) => reject(x.HELP), resolve)
  )(argv);
});
var defaultNameTemplate = (ns) => [`.${ns}rc`, `.${ns}rc.json`];
var configFileWithCancel = curry3((cancel, opts) => {
  let refF;
  const optString = typeof opts === "string";
  if (optString || opts.source) {
    const source = opts.source || opts;
    log.builder(`loading directly!`, source);
    refF = readFileWithCancel(cancel, source);
  }
  const defOpts = !optString ? opts : {};
  const {
    findUp: findUpOpts = {},
    ns = "climate",
    wrapTransformer = true,
    json = true,
    template = defaultNameTemplate,
    transformer = json ? JSON.parse : I,
    optional = false
  } = defOpts;
  const searchspace = template(ns);
  if (!refF) {
    log.builder(`looking in...`, searchspace);
    refF = pipe2(
      findUpWithCancel(cancel, findUpOpts),
      chain(readFileWithCancel(cancel)),
      optional && json ? pipe2(
        coalesce(() => ({ source: "No config found!" }))(I),
        map2(JSON.stringify),
        map2(log.builder("...hey how?"))
      ) : I
    )(searchspace);
  }
  const transform = wrapTransformer ? map2(transformer) : transformer;
  return pipe2(transform)(refF);
});
var configFile = configFileWithCancel(NO_OP);
export {
  NO_OP,
  configFile,
  configFileWithCancel,
  configurate,
  defaultNameTemplate,
  failIfMissingFlag,
  generateHelp,
  invalidHelpConfig,
  longFlag,
  shortFlag,
  showHelpWhen
};
