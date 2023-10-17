#!/usr/bin/env node

// src/cli.js
import { resolve as pathResolve } from "node:path";
import { pipe as pipe2, chain as chain2, map as map2 } from "ramda";
import { fork, parallel as parallel2 } from "fluture";
import { interpret } from "file-system";

// src/reader.js
import path from "node:path";
import {
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
    chain(
      (files) => pipe(map(readMonoFile(config.basePath, config.trim)), parallel(10))(files)
    )
  )(dirglob);
});
var monoprocessor = curry(
  (config, pluginsF, dirGlob) => pipe(readAll(config), futureFileProcessor(config, pluginsF))(dirGlob)
);

// src/cli.js
import { configurate } from "configurate";

// package.json
var package_default = {
  name: "monocle",
  version: "0.0.0",
  description: "Apply plugins to a future-based file-system",
  main: "monocle.js",
  type: "module",
  repository: "monoculture",
  author: "brekk",
  license: "ISC",
  private: true,
  dependencies: {
    configurate: "*",
    envtrace: "^0.0.2",
    fluture: "^14.0.0",
    monorail: "*",
    ramda: "^0.29.0"
  },
  devDependencies: {
    "eslint-config-monoculture": "*",
    execa: "^8.0.1",
    "jest-config": "*",
    "plugin-robot-tourist": "*"
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
    rulefile: ["c"],
    ignore: ["i"],
    plugin: ["p"],
    rule: ["r"],
    error: ["e"],
    trim: ["t"]
  },
  boolean: ["help", "trim"],
  array: ["plugin", "rule", "ignore"],
  configuration: {
    "strip-aliased": true
  }
};
var CONFIG_DEFAULTS = {};
var HELP_CONFIG = {
  help: `This text you're reading now!`,
  ignore: `Pass ignore values to glob. Array type`,
  trim: "Trim the lines on read",
  plugin: "Specify a plugin to add to the run. Multiple plugins can be specified by invoking monocle with multiple flags, e.g. --plugin x --plugin y",
  rule: "Specify a rule to add to the run. Multiple rules can be specified by invoking monocle with multiple flags, e.g. --rule one --rule two",
  error: "Should this invocation be a warning or an error?",
  rulefile: "Express the context of a run in a single file. This overrides all other flags (except --help)"
};

// src/cli.js
pipe2(
  configurate(
    CONFIG,
    { ...CONFIG_DEFAULTS, basePath: process.cwd() },
    HELP_CONFIG,
    package_default.name
  ),
  map2(log.config("parsed")),
  chain2((config) => {
    const { basePath, plugin: plugins = [], _: dirGlob = [] } = config;
    const pluginsF = pipe2(
      map2(
        pipe2(log.plugin("loading"), (x) => pathResolve(basePath, x), interpret)
      ),
      parallel2(10)
    )(plugins);
    return monoprocessor(config, pluginsF, dirGlob[0]);
  }),
  // eslint-disable-next-line no-console
  fork(console.warn)(console.log)
)(process.argv.slice(2));
