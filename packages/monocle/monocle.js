#!/usr/bin/env node

// src/cli.js
import { pipe as pipe2, chain as chain2, map as map2 } from "ramda";
import { fork } from "fluture";

// src/reader.js
import path from "node:path";
import { curry, pipe, map, split, addIndex, fromPairs, chain } from "ramda";
import { parallel, resolve } from "fluture";
import { trace } from "xtrace";
import { readDirWithConfig, readFile } from "file-system";
import { futureFileProcessor } from "monorail";

// src/hash.js
import crypto from "node:crypto";
var hash = (buf) => {
  const sum = crypto.createHash("sha256");
  sum.update(buf);
  return sum.digest("hex");
};

// src/reader.js
var readMonoFile = curry(
  (basePath, file) => pipe(
    readFile,
    map(
      (buf) => pipe(
        split("\n"),
        addIndex(map)((y, i) => [i, y]),
        (body) => ({
          file: path.relative(basePath, file),
          hash: hash(buf),
          body
        })
      )(buf)
    )
  )(file)
);
var readAll = curry(
  (config, dirglob) => pipe(
    trace("readallllll"),
    readDirWithConfig(config),
    map(trace("oh hey")),
    chain(
      (files) => pipe(map(readMonoFile(config.basePath)), parallel(10))(files)
    )
  )(dirglob)
);
var monoprocessor = curry(
  (config, plugins, dirGlob) => pipe(
    trace("dirglobbo"),
    readAll(config),
    map(trace("glibbo")),
    futureFileProcessor(config, resolve(plugins))
  )(dirGlob)
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
    fluture: "^14.0.0",
    monorail: "*",
    ramda: "^0.29.0"
  },
  devDependencies: {
    "eslint-config-monoculture": "*",
    "jest-config": "*"
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
    plugin: ["p"],
    rule: ["r"],
    error: ["e"],
    rulefile: ["c"]
  }
};
var CONFIG_DEFAULTS = {};
var HELP_CONFIG = {
  help: `This text you're reading now!`,
  plugin: "Specify a plugin to add to the run. Multiple plugins can be specified by invoking monocle with multiple flags, e.g. --plugin x --plugin y",
  rule: "Specify a rule to add to the run. Multiple rules can be specified by invoking monocle with multiple flags, e.g. --rule one --rule two",
  error: "Should this invocation be a warning or an error?",
  rulefile: "Express the context of a run in a single file. This overrides all other flags (except --help)"
};

// src/cli.js
import { trace as trace2 } from "xtrace";
pipe2(
  trace2("input!"),
  (x) => configurate(
    CONFIG,
    { ...CONFIG_DEFAULTS, basePath: process.cwd() },
    HELP_CONFIG,
    package_default.name,
    x
  ),
  trace2("raw"),
  chain2((config) => {
    trace2("parsed", config);
    const { plugins = [], _: dirGlob } = config;
    return monoprocessor(config, plugins, dirGlob);
  }),
  // eslint-disable-next-line no-console
  fork(console.warn)(console.log)
)(process.argv.slice(2));
