#!/usr/bin/env node
import { createRequire as topLevelCreateRequire } from "module";
 const require = topLevelCreateRequire(import.meta.url);

// src/runner.js
import { Chalk } from "chalk";
import { closest, distance } from "fastest-levenshtein";
import {
  __,
  split,
  filter,
  identity as I,
  propOr,
  chain,
  last,
  pipe as pipe2,
  curry as curry2,
  map as map2,
  keys,
  pathOr,
  uniq,
  tap as tap2
} from "ramda";
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
    chalk: "^5.3.0",
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
    "fastest-levenshtein": "^1.0.16",
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

// src/recursive.js
import {
  allPass,
  tap,
  complement,
  is,
  curry,
  pipe,
  toPairs,
  map,
  fromPairs,
  T,
  cond
} from "ramda";
var isArray = Array.isArray;
var isType = (t) => (x) => typeof x === t;
var isObject = allPass([is(Object), complement(isArray), isType("object")]);
var mapSnd = curry((fn, [k, v]) => [k, fn(v)]);
var I2 = curry((a, b) => b);
var recurse = curry(
  ({
    pair: processPair = I2,
    field: processField = I2,
    list: processList = I2
  }, raw) => {
    function walk(steps) {
      return (x) => cond([
        [isArray, map(pipe(processList(steps), walk(steps)))],
        [
          isObject,
          pipe(
            toPairs,
            map((pair) => {
              const newSteps = [...steps];
              return pipe(
                tap(([k, v]) => {
                  newSteps.push(k);
                  return [k, v];
                }),
                processPair(newSteps),
                mapSnd(walk(newSteps))
              )(pair);
            }),
            fromPairs
          )
        ],
        [T, processField(steps)]
      ])(x);
    }
    return walk([])(raw);
  }
);

// src/runner.js
import { $, execa } from "execa";
import { bimap, Future, resolve } from "fluture";

// src/config.js
import { generateHelp } from "configurate";
var YARGS_CONFIG = {
  alias: {
    // these come from `nps`
    silent: ["s"],
    scripts: [],
    config: ["c"],
    logLevel: ["l"],
    require: ["r"],
    helpStyle: ["y"],
    // these are things we've added
    future: ["f"],
    color: ["k"]
  },
  array: ["require"],
  boolean: ["silent", "scripts", "future", "color"],
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
`,
  future: `Use Futures instead of Promises`,
  color: `Render things with color? (Default: true)`
};
var CONFIG_DEFAULTS = {
  scripts: true,
  future: false,
  helpStyle: "all",
  color: true
};
var HELP = generateHelp(package_default.name, HELP_CONFIG, YARGS_CONFIG);

// src/runner.js
var $f = curry2(
  (cancel, raw) => Future((bad, good) => {
    $(raw).catch(bad).then(good);
    return cancel;
  })
);
var getScriptFromTask = (t) => {
  if (t.script)
    t = t.script;
  if (t.default)
    t = t.default;
  return t;
};
var makeScriptGetter = curry2(
  (scripts, task) => pipe2(split("."), pathOr(false, __, scripts), getScriptFromTask)(task)
);
var getNestedTasks = (scripts) => {
  const getScript = makeScriptGetter(scripts);
  let tasks = keys(scripts);
  recurse(
    {
      pair: curry2((crumbs, [k, v]) => {
        if (k !== "description" && k !== "script") {
          tasks = uniq(tasks.concat([crumbs.join(".")]));
        }
        return [k, v];
      }),
      literal: curry2((crumbs = [], x) => {
        const crumb = last(crumbs);
        tasks = uniq(tasks.concat(crumb));
        return x;
      })
    },
    scripts
  );
  return pipe2(
    filter((taskName) => {
      let task = getScript(taskName);
      if (typeof task === "object")
        return false;
      return true;
    })
  )(tasks);
};
var flexecaWithCancel = curry2(
  (cancel, a, b, c) => Future((bad, good) => {
    execa(a, b, c).catch(bad).then(good);
    return cancel;
  })
);
var EXECA_FORCE_COLOR = {
  env: { FORCE_COLOR: "true" }
};
var getStdOut = propOr("", "stdout");
var executeWithCancel = curry2((cancel, { tasks, scripts, config }) => {
  const chalk = new Chalk({ level: config.color ? 2 : 0 });
  if (config.help)
    return config.HELP;
  const getScript = makeScriptGetter(scripts);
  if (config._.length > 0) {
    const [task] = config._;
    if (tasks.includes(task)) {
      const get = getScript(task);
      const script = typeof get === "string" ? get : get.script;
      console.log(
        `Running...
${chalk.inverse(task)}: \`${chalk.green(script)}\``
      );
      const [cmd, ...args] = script.split(" ");
      if (script) {
        return pipe2(bimap(getStdOut)(getStdOut))(
          flexecaWithCancel(cancel, cmd, args, {
            cwd: process.cwd(),
            ...config.color ? EXECA_FORCE_COLOR : {}
          })
        );
      }
    } else {
      console.log(`I cannot understand the ${task} command.`);
      const lookup = closest(task, tasks);
      if (distance(task, lookup) < 4) {
        console.log(`Did you mean to run "${lookup}" instead?`);
      }
    }
  }
  const commands = pipe2(
    map2((task) => `${chalk.green(task)} - ${getScript(task)}`)
  )(tasks);
  return resolve(
    config.HELP + `

${chalk.inverse("Available commands:")}

${commands.join("\n")}`
  );
});
var runnerWithCancel = curry2(
  (cancel, argv) => pipe2(
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
      }) => {
        return pipe2(
          log.config("reading..."),
          interpret,
          map2(
            pipe2(
              pathOr({}, ["default", "scripts"]),
              (loadedScripts) => ({
                config: parsedConfig,
                scripts: loadedScripts,
                tasks: getNestedTasks(loadedScripts),
                source
              }),
              tap2(pipe2(propOr([], "tasks"), log.config("tasks")))
            )
          ),
          chain(executeWithCancel(cancel))
        )(source);
      }
    )
  )(argv)
);
var runner = runnerWithCancel(() => {
});

// src/cli.js
import { fork } from "fluture";
fork(console.warn)(console.log)(runner(process.argv.slice(2)));
