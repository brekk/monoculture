#!/usr/bin/env node

// src/cli.js
import { resolve as pathResolve } from "node:path";
import { always as K, pipe as pipe2, chain as chain2, map as map2, length } from "ramda";
import { fork, parallel as parallel2, resolve as resolve2 } from "fluture";
import { interpret, writeFile } from "file-system";

// src/reader.js
import path from "node:path";
import {
  identity as I,
  curry,
  pipe,
  map,
  trim,
  split,
  addIndex,
  fromPairs,
  chain
} from "ramda";
import { parallel, resolve } from "fluture";
import { readDirWithConfig, readFile } from "file-system";
import { futureFileProcessor } from "monorail";

// src/hash.js
import crypto from "node:crypto";
var hash = (buf) => {
  const sum = crypto.createHash("sha256");
  sum.update(buf);
  return sum.digest("hex");
};

// src/trace.js
import { complextrace } from "envtrace";
var log = complextrace("monocle", ["config", "file", "plugin"]);

// src/reader.js
var readMonoFile = curry(
  (basePath, trimContent, file) => pipe(
    log.file("reading"),
    readFile,
    map(
      (buf) => pipe(
        split("\n"),
        // ostensibly files have content that starts at a 1 index
        addIndex(map)((y, i) => [i + 1, trimContent ? trim(y) : y]),
        (body) => ({
          file: path.relative(basePath, file),
          hash: hash(buf),
          body
        })
      )(buf)
    )
  )(file)
);
var readAll = curry((config, dirglob) => {
  return pipe(
    log.file("reading glob"),
    readDirWithConfig({ ...config, nodir: true }),
    config.showMatchesOnly ? I : chain(
      (files) => pipe(
        map(readMonoFile(config.basePath, config.trim)),
        parallel(10)
      )(files)
    )
  )(dirglob);
});
var monoprocessor = curry(
  (config, pluginsF, dirGlob) => pipe(
    readAll(config),
    config.showMatchesOnly ? I : futureFileProcessor(config, pluginsF)
  )(dirGlob)
);

// src/cli.js
import { configurate, configFile } from "climate";

// package.json
var package_default = {
  name: "monocle",
  version: "0.0.0",
  description: "Apply plugins to a future-based file-system",
  bin: "monocle.js",
  main: "monocle.js",
  type: "module",
  repository: "monoculture",
  author: "brekk",
  license: "ISC",
  private: true,
  dependencies: {
    climate: "workspace:packages/climate",
    envtrace: "^0.0.2",
    fluture: "^14.0.0",
    monorail: "workspace:packages/monorail",
    ramda: "^0.29.1"
  },
  devDependencies: {
    "dotenv-cli": "^7.3.0",
    esbuild: "^0.19.5",
    "eslint-config-monoculture": "workspace:shared/eslint-config-monoculture",
    execa: "^8.0.1",
    jest: "^29.7.0",
    "jest-config": "workspace:shared/jest-config",
    "robot-tourist": "workspace:packages/robot-tourist"
  },
  scripts: {
    nps: "dotenv -- nps -c ./package-scripts.cjs",
    build: "dotenv -- nps -c ./package-scripts.cjs build",
    lint: "dotenv -- nps -c ./package-scripts.cjs lint",
    test: "dotenv -- nps -c ./package-scripts.cjs test",
    "test:watch": "dotenv -- nps -c ./package-scripts.cjs test.watch"
  }
};

// src/config.js
var CONFIG = {
  alias: {
    help: ["h"],
    showMatchesOnly: ["m", "showMatches"],
    showTotalMatchesOnly: ["n", "showTotalMatches"],
    rulefile: ["c"],
    ignore: ["i"],
    plugin: ["p", "plugins"],
    rule: ["r", "rules"],
    error: ["e"],
    trim: ["t"],
    output: ["o"],
    jsonIndent: ["j"],
    color: ["k"]
  },
  number: ["jsonIndent"],
  boolean: ["help", "trim", "showMatchesOnly", "color"],
  array: ["plugin", "rule", "ignore"],
  configuration: {
    "strip-aliased": true
  }
};
var CONFIG_DEFAULTS = {
  output: "monocle-findings.json",
  showMatchesOnly: false,
  showTotalMatchesOnly: false,
  jsonIndent: 2,
  color: true
};
var HELP_CONFIG = {
  help: `This text you're reading now!`,
  color: `Do stuff with glorious color`,
  ignore: `Pass ignore values to glob. Array type`,
  trim: "Trim the lines on read",
  plugin: `Specify a plugin to add to the run.
  Multiple plugins can be specified by invoking monocle with multiple flags, e.g.
    monocle --plugin x --plugin y`,
  rule: `Specify a rule to add to the run.
  Multiple rules can be specified by invoking monocle with multiple flags, e.g.
    monocle --rule one --rule two`,
  error: "Should this invocation be a warning or an error?",
  rulefile: `Express the context of a run in a single file.
  This overrides all other flags (except --help)`,
  output: "Where should the findings be written?",
  showMatchesOnly: `List the files which matched the search, but *do not* run plugins`,
  showTotalMatchesOnly: `List the number files which matched the search, but *do not* run plugins (implies -m)`,
  jsonIndent: `How much should we indent JSON output? (default: 2)`
};

// src/cli.js
var j = (i) => (x) => JSON.stringify(x, null, i);
pipe2(
  configurate(
    CONFIG,
    { ...CONFIG_DEFAULTS, basePath: process.cwd() },
    HELP_CONFIG,
    { name: package_default.name, description: package_default.description }
  ),
  chain2((config) => {
    const result = config.rulefile ? pipe2(
      configFile({ ns: "monocle" }),
      map2((read) => ({ ...config, ...read.config }))
    )(config.rulefile) : (
      // TODO we should eschew chain(Future(x))
      resolve2(config)
    );
    return result;
  }),
  map2(log.config("parsed")),
  chain2((config) => {
    const plugins = config.plugin || config.plugins || [];
    const { basePath, _: dirGlob = [] } = config;
    log.plugin("plugins...", plugins);
    if (config.showTotalMatchesOnly)
      config.showMatchesOnly = true;
    const pluginsF = pipe2(
      map2(
        pipe2(log.plugin("loading"), (x) => pathResolve(basePath, x), interpret)
      ),
      parallel2(10)
    )(plugins);
    return pipe2(
      monoprocessor(config, pluginsF),
      map2((z) => [config, z])
    )(dirGlob[0]);
  }),
  chain2(
    ([{ showMatchesOnly, showTotalMatchesOnly, jsonIndent, output }, body]) => pipe2(
      showMatchesOnly ? (
        // later we should make this less clunky (re-wrapping futures)
        pipe2(showTotalMatchesOnly ? length : j(jsonIndent), resolve2)
      ) : pipe2(
        j(jsonIndent),
        writeFile(output),
        map2(K(`Wrote file to ${output}`))
      )
    )(body)
  ),
  // eslint-disable-next-line no-console
  fork(console.warn)(console.log)
)(process.argv.slice(2));
