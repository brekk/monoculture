// src/help.js
import { Chalk } from "chalk";
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
      banner: $banner = "",
      name: $name,
      description: $desc = ""
    } = $details;
    const chalk = new Chalk({ level: showColor ? 2 : 0 });
    const nameStyler = when(() => showColor, pipe(pad, chalk.inverse));
    return pipe(
      propOr({}, "alias"),
      toPairs,
      map(
        ([k, v]) => pipe(
          applySpec({
            flags: pipe(
              (x) => [x],
              concat(v),
              map(ifElse(pipe(length, equals(1)), shortFlag, longFlag)),
              map(chalk.green),
              join(" / ")
            ),
            description: pipe(
              propOr("???", $, helpConfig),
              failIfMissingFlag("development", k)
            )
          }),
          ({ flags, description }) => `  ${flags}
  	${description.replace(/\n/g, "\n  	")}`
        )(k)
      ),
      join("\n\n"),
      (z) => `${$banner ? $banner + "\n" : ""}${showName ? nameStyler($name) : ""}${$desc ? "\n\n" + $desc : ""}

${z}`
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
import { findUp as __findUp } from "find-up";
var NO_OP = () => {
};
var showHelpWhen = curry3(
  (check, parsed) => parsed.help || check(parsed)
);
var configurateWithOptions = curry3(
  ({ check = alwaysFalse }, yargsConf, defaults, help, details, argv) => {
    const $help = ["help"];
    const { boolean: $yaBool } = yargsConf;
    const updatedConfig = mergeRight2(yargsConf, {
      alias: mergeRight2(yargsConf.alias, { help: ["h"] }),
      boolean: !$yaBool ? $help : $yaBool.includes("help") ? $yaBool : $yaBool.concat(help)
    });
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
  let refF;
  const optString = typeof opts === "string";
  if (optString || opts.source) {
    refF = readFileWithCancel(cancel, opts.source || opts);
  }
  const defOpts = !optString ? opts : {};
  const {
    findUp: findUpOpts,
    ns = "configurate",
    wrapTransformer = true,
    json = true,
    template = defaultNameTemplate,
    transformer = json ? JSON.parse : I
  } = defOpts;
  const finder = findUpWithCancel(cancel, findUpOpts);
  const searchspace = template(ns);
  if (!refF) {
    refF = pipe2(finder, chain(readFileWithCancel(cancel)))(searchspace);
  }
  const transform = wrapTransformer ? map2(transformer) : transformer;
  return pipe2(transform)(refF);
});
var configFile = configFileWithOptionsAndCancel(NO_OP);
export {
  NO_OP,
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
