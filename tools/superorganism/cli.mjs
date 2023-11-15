#!/usr/bin/env node
import { createRequire as topLevelCreateRequire } from "module";
 const require = topLevelCreateRequire(import.meta.url);

// src/runner.js
import { chain, pipe, map, pathOr } from "ramda";
import { configurate } from "configurate";
import { interpret } from "file-system";

// src/trace.js
import { complextrace } from "envtrace";

// package.json
var package_default = {
  name: "superorganism",
  version: "0.0.0",
  description: "execa + nps-utils",
  type: "module",
  main: "superorganism.js",
  bin: "cli.mjs",
  repository: "monoculture",
  author: "brekk",
  license: "ISC",
  private: true,
  dependencies: {
    configurate: "workspace:packages/configurate",
    "dotenv-cli": "^7.3.0",
    envtrace: "^0.0.2",
    "file-system": "workspace:packages/file-system",
    fluture: "^14.0.0",
    "project-bin-path": "^2.0.0",
    ramda: "^0.29.1"
  },
  devDependencies: {
    esbuild: "^0.19.5",
    "eslint-config-monoculture": "workspace:shared/eslint-config-monoculture",
    "jest-config": "workspace:shared/jest-config"
  },
  scripts: {
    nps: "dotenv -- nps -c ./package-scripts.cjs",
    build: "dotenv -- nps -c ./package-scripts.cjs build",
    "build:cli": "dotenv -- nps -c ./package-scripts.cjs build.cli",
    "build:main": "dotenv -- nps -c ./package-scripts.cjs build.main",
    "build:watch": "dotenv -- nps -c ./package-scripts.cjs build.watch",
    dev: "dotenv -- nps -c ./package-scripts.cjs dev",
    lint: "dotenv -- nps -c ./package-scripts.cjs lint",
    meta: "dotenv -- nps -c ./package-scripts.cjs meta",
    "meta:graph": "dotenv -- nps -c ./package-scripts.cjs meta.graph",
    test: "dotenv -- nps -c ./package-scripts.cjs test",
    "test:watch": "dotenv -- nps -c ./package-scripts.cjs test.watch"
  }
};

// src/trace.js
var log = complextrace(package_default.name, ["info", "config", "io"]);

// src/config.js
import { generateHelp } from "configurate";
var YARGS_CONFIG = {
  alias: {
    silent: ["s"],
    scripts: [],
    config: ["c"],
    logLevel: ["l"],
    require: ["r"],
    helpStyle: ["y"]
  },
  array: ["require"],
  boolean: ["silent", "scripts"],
  configuration: {
    "strip-aliased": true
  }
};
var HELP_CONFIG = {
  help: "This text!",
  silent: "By default, superorganism will log out to the console before running the command. You can add -s to your command to silence this.",
  scripts: "By default, the script's command text will log out to the console before running the command. You can add --no-scripts to prevent this.",
  config: `Use a different config

\`\`\`
superorganism -c ./other/package-scripts.js lint
\`\`\`

Normally, superorganism will look for a package-scripts.js file and load that to get the scripts. Generally you'll want to have this at the root of your project (next to the package.json). But by specifying -c or --config, superorganism will use that file instead.`,
  logLevel: `Specify the log level to use`,
  require: `You can specify a module which will be loaded before the config file is loaded. This allows you to preload for example babel-register so you can use all babel presets you like.`,
  helpStyle: `By default, superorganism will dump a very long help documentation to the screen based on your package-scripts.js file. You can modify this output with one of three help-style options:

all gives you the normal default output:

\`\`\`
superorganism help "--help-style all"
\`\`\`

scripts will give you only the help information built from your package-scripts.js file

\`\`\`
superorganism help "--help-style scripts"
\`\`\`

basic will give you only the name and description of the scripts from your package-scripts.js file

\`\`\`
superorganism help "--help-style basic"
\`\`\`
`
};
var CONFIG_DEFAULTS = {
  scripts: true,
  helpStyle: "all"
};
var HELP = generateHelp(package_default.name, HELP_CONFIG, YARGS_CONFIG);

// src/runner.js
var runner = (argv) => pipe(
  configurate(
    YARGS_CONFIG,
    { ...CONFIG_DEFAULTS, basePath: process.cwd() },
    HELP_CONFIG,
    package_default.name
  ),
  chain(
    ({
      basePath,
      config: source = `${basePath}/package-scripts.mjs`,
      ...parsedConfig
    }) => pipe(
      log.config("importing..."),
      interpret,
      map(
        pipe(
          pathOr({}, ["default", "scripts"]),
          log.config("scripts"),
          (loadedScripts) => ({
            config: parsedConfig,
            scripts: loadedScripts,
            source
          })
        )
      )
    )(source)
  )
)(argv);

// src/cli.js
import { fork } from "fluture";
fork(console.warn)(console.log)(runner(process.argv.slice(2)));
