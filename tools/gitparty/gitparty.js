#!/usr/bin/env node

// src/runner.js
import path from "node:path";
import { configFileWithCancel, configurate } from "configurate";
import { Chalk } from "chalk";
import { mapRej, resolve } from "fluture";
import { writeFileWithConfigAndCancel } from "file-system";
import { ifElse, curry, map, chain, pipe } from "ramda";

// src/config.js
var YARGS_CONFIG = {
  configuration: {
    "strip-aliased": true
  },
  alias: {
    help: ["h"],
    init: ["i"],
    color: ["k"],
    config: ["c"],
    repo: ["r"],
    timezone: ["t", "tz"],
    filter: ["f"],
    collapseAuthors: ["a", "collapse"],
    json: ["j"],
    excludeMergeCommits: ["m"],
    output: ["o"],
    totalCommits: ["n"],
    aliases: ["a", "alias"]
  },
  boolean: ["excludeMergeCommits", "collapseAuthors", "init"],
  array: ["aliases"]
};
var CONFIG_DEFAULTS = {
  // this is our config
  excludeMergeCommits: true,
  collapseAuthors: false,
  filter: ``,
  json: false,
  // fill in at runtime
  // repo: process.cwd(),
  // below this line are gitlog configuration
  totalCommits: 50,
  fields: [
    "abbrevHash",
    "subject",
    "authorName",
    "authorDate",
    "authorDateRel"
  ],
  timezone: `UTC`,
  execOptions: { maxBuffer: 1e3 * 1024 },
  color: true
};
var HELP_CONFIG = {
  help: "This text!",
  color: "Render things in glorious color!",
  init: "Initialize and create a new `.gitpartyrc` file",
  config: "Select a config file other than `.gitpartyrc`",
  output: "Write the results to a file. Usually useful in concert with the --json flag",
  json: "Return JSON ouput instead of rendering as strings",
  repo: "Select a different git repository",
  totalCommits: "Choose the number of total commits",
  collapseAuthors: "Merge commits if the authors are the same and commit dates are the same",
  excludeMergeCommits: "Exclude merge commits from the results",
  filter: `Filter commits based on a simple 'key:value' / 'key:value#key2:value2' base syntax:
\`-f "hash:80ca7f7" / -f "date:20-05-2018"\`
	Lookup by exact string matching (default)
\`-f "subject:fix~"\`
	Lookup by looser indexOf matching when there is a tilde "~" character at the end of the value
\`-f "subject:fix~#date:20-05-2018"\`
	Lookup with multiple facets, separated by a hash "#" symbol
\`-f "author:brekk"\`
	When filtering by author, the alias lookup (if aliases have been defined) is used
\`-f "files:**/src/*.spec.js"\`
	When there are asterisks present in the value side (after the ":") and the key is an array, glob-style matching is performed
\`-f "analysis.config:true"\`
	When there is a period "." in the key, nested-key lookups will be performed
\`-f "x:true" / -f "x:false"\`
	When the value is either the literal string "true" or "false", it will be coerced into a boolean`,
  timezone: "Set the timezone you want to see results in. Defaults to UTC",
  aliases: "Define author aliases (useful if authors do not merge under consistent git `user.name`s / `user.email`s)"
};
var DEFAULT_CONFIG_FILE = {
  gitpartyrc: {
    key: "G",
    color: "bgRed",
    matches: ["**/.gitpartyrc*", "**/.gitpartyrc"]
  },
  collapseAuthors: false,
  timezone: "UTC"
};
var MAKE_A_GITPARTYRC_FILE = (c) => `Unable to find a .gitpartyrc file! You can create one with \`${c.yellow(
  "gitparty --init"
)}\``;

// package.json
var package_default = {
  name: "gitparty",
  version: "0.0.0",
  description: "A party for your git log",
  main: "enscribe.js",
  type: "module",
  repository: "monoculture",
  author: "brekk",
  license: "ISC",
  private: true,
  dependencies: {
    configurate: "workspace:packages/configurate",
    "file-system": "workspace:packages/file-system",
    fluture: "^14.0.0",
    gitlog: "^4.0.8",
    ramda: "^0.29.1"
  },
  devDependencies: {
    "dotenv-cli": "^7.3.0",
    "eslint-config-monoculture": "workspace:shared/eslint-config-monoculture",
    "jest-config": "workspace:shared/jest-config"
  },
  scripts: {
    nps: "dotenv -- nps -c ./package-scripts.cjs",
    build: "dotenv -- nps -c ./package-scripts.cjs build",
    "build:watch": "dotenv -- nps -c ./package-scripts.cjs build.watch",
    dev: "dotenv -- nps -c ./package-scripts.cjs dev",
    lint: "dotenv -- nps -c ./package-scripts.cjs lint",
    meta: "dotenv -- nps -c ./package-scripts.cjs meta",
    "meta:graph": "dotenv -- nps -c ./package-scripts.cjs meta.graph",
    test: "dotenv -- nps -c ./package-scripts.cjs test",
    "test:watch": "dotenv -- nps -c ./package-scripts.cjs test.watch"
  }
};

// src/runner.js
var { name: $NAME, description: $DESC } = package_default;
var runner = curry(
  (cancel, argv) => pipe(
    configurate(
      YARGS_CONFIG,
      { ...CONFIG_DEFAULTS, repo: process.cwd(), cwd: process.cwd() },
      HELP_CONFIG,
      {
        name: $NAME,
        description: $DESC
      }
    ),
    chain(($config) => {
      const { cwd, color: useColor, config, help, HELP, init } = $config;
      if (init) {
        const filepath = path.resolve(cwd, ".gitpartyrc");
        return pipe(
          writeFileWithConfigAndCancel(cancel, { encoding: "utf8" }, filepath),
          map(() => `Wrote file to "${filepath}"!`)
        )(JSON.stringify(DEFAULT_CONFIG_FILE, null, 2));
      }
      const chalk = new Chalk({ level: useColor ? 2 : 0 });
      return pipe(
        ifElse(
          () => help,
          () => resolve(HELP),
          pipe(
            configFileWithCancel(cancel),
            mapRej(
              (e) => e?.message?.includes("No config file found") ? MAKE_A_GITPARTYRC_FILE(chalk) : e
            )
          )
        )
      )(
        config ? config : {
          ns: package_default.name
        }
      );
    })
  )(argv)
);

// src/cli.js
import { fork } from "fluture";
fork(console.warn)(console.log)(runner(() => {
}, process.argv.slice(2)));
