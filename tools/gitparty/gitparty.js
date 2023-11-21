#!/usr/bin/env node

// src/runner.js
import path from "node:path";
import { zonedTimeToUtc, utcToZonedTime } from "date-fns-tz";

// src/legend.js
import { pipe, map, toPairs, curry, join } from "ramda";
var legendBlocks = curry(
  (chalk, x) => pipe(
    toPairs,
    map(([k, v]) => chalk.black(`${v.fn(` ${v.key} `)} = ${k}`)),
    join(" ")
  )(x)
);
var printLegend = curry(
  (chalk, x) => pipe(legendBlocks(chalk), (y) => `LEGEND: ${y}
`)(x)
);

// src/runner.js
import { trace } from "xtrace";
import { configFileWithCancel, configurate } from "climate";
import { Chalk } from "chalk";
import {
  swap,
  mapRej,
  resolve,
  coalesce,
  reject as rejectF,
  ap as apF,
  and as andF
} from "fluture";
import { writeFileWithConfigAndCancel, findUpWithCancel } from "file-system";
import {
  zip,
  fromPairs,
  groupBy,
  head,
  identity as I,
  includes,
  mergeRight as mergeRight2,
  objOf,
  propOr,
  reject,
  startsWith,
  toPairs as toPairs2,
  uniq,
  __ as $,
  ap,
  cond,
  curry as curry4,
  always as K,
  map as map2,
  chain,
  F,
  T,
  pipe as pipe2
} from "ramda";

// src/alias.js
import { curry as curry2, mergeRight } from "ramda";
var alias = curry2((object, from, to) => {
  if (!object[to]) {
    object[to] = from;
  }
  if (!object[from]) {
    object[from] = object[to];
  }
});
var pureAliasedListeners = curry2((subscriber, original, alt, seed) => {
  const emitted = mergeRight(seed, { [alt]: original, [original]: original });
  subscriber(emitted);
  return emitted;
});
var getAliasFrom = curry2(
  (object, key) => object && object[key] || key
);
var canonicalize = (object) => ({
  canonize: (a, b = a) => alias(object, a, b),
  getCanon: getAliasFrom(object)
});

// src/errors.js
var GITPARTY_CONFIG_NEEDED = (c) => `Unable to find a .gitpartyrc file! You can create one with \`${c.yellow(
  "gitparty --init"
)}\``;
var THIS_IS_NOT_A_GIT_REPO = (c) => `gitparty only works in git repositories! Did you mean to \`${c.yellow(
  "git init"
)}\` first?`;
var CONFIG_NOT_VALID = `gitparty cannot understand your .gitpartyrc file! Please edit it`;

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
  filter: (c) => {
    const { yellow: y, bold: d, cyan: n } = c;
    return `Filter commits based on a simple '${y("key")}:${n("value")}' / '${y(
      "key"
    )}:${n("value")}#${y("key2")}:${n("value2")}' base syntax:
\`-f "${y("hash")}:${n("80ca7f7")}" / -f "${y("date")}:${n("20-05-2018")}"\`
	Lookup by exact string matching (default)
\`-f "${y("subject")}:${n("fix~")}"\`
	Lookup by looser indexOf matching when there is a tilde "~" character at the end of the value
\`-f "${y("subject")}:${n("fix~")}#${y("date")}:${n("20-05-2018")}"\`
	Lookup with multiple facets, separated by a hash "#" symbol
\`-f "${y("author")}:${n("brekk")}"\`
	When filtering by author, the alias lookup (if aliases have been defined) is used
\`-f "${y("files")}:${n("**/src/*.spec.js")}"\`
	When there are asterisks present in the value side (after the ":") and the key is an array, glob-style matching is performed
\`-f "${y("x")}:${n("true")}" / -f "${y("x")}:${n("false")}"\`
	When the value is either the literal string "true" or "false", it will be coerced into a boolean
\`-f "${y("analysis.config")}:${n("true")}"\`
	When there is a period "." in the key, nested-key lookups will be performed`;
  },
  timezone: "Set the timezone you want to see results in. Defaults to UTC",
  aliases: "Define author aliases (useful if authors do not merge under consistent git `user.name`s / `user.email`s)"
};
var DEFAULT_CONFIG_FILE = {
  patterns: {
    gitpartyrc: {
      key: "G",
      color: "bgRed",
      matches: ["**/.gitpartyrc*", "**/.gitpartyrc"]
    }
  },
  collapseAuthors: false,
  timezone: "UTC"
};

// src/git.js
import { curry as curry3 } from "ramda";
import GLOG from "gitlog";
import { Future } from "fluture";
var { default: glog } = GLOG;
var NO_OP = () => {
};
var gitlogWithCancel = curry3(
  (cancel, opts) => Future((bad, good) => {
    glog(opts, (e, data) => e ? bad(e) : good(data));
    return cancel;
  })
);
var gitlog = gitlogWithCancel(NO_OP);

// src/log.js
import { complextrace } from "envtrace";
var log = complextrace("gitparty", ["config", "configFile", "info"]);

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
    climate: "workspace:packages/climate",
    "date-fns": "^2.30.0",
    "date-fns-tz": "^2.0.0",
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
var j2 = (x) => JSON.stringify(x, null, 2);
var { name: $NAME, description: $DESC } = package_default;
var writeInitConfigFileWithCancel = curry4(
  (cancel, filepath) => pipe2(
    j2,
    writeFileWithConfigAndCancel(cancel, { encoding: "utf8" }, filepath),
    map2(K(`Wrote file to "${filepath}"!`))
  )(DEFAULT_CONFIG_FILE)
);
var loadPartyFile = curry4(
  (cancel, { cwd, color: useColor, config, help, HELP, init }) => {
    const chalk = new Chalk({ level: useColor ? 2 : 0 });
    return pipe2(
      cond([
        [
          K(init),
          () => pipe2(
            writeInitConfigFileWithCancel(cancel),
            swap
          )(path.resolve(cwd, ".gitpartyrc"))
        ],
        [K(help), K(resolve(HELP))],
        [
          T,
          pipe2(
            log.configFile("trying to load config..."),
            configFileWithCancel(cancel),
            map2(log.configFile("loaded...")),
            mapRej(
              pipe2(
                log.configFile("error..."),
                propOr("", "message"),
                cond([
                  [
                    includes("No config file found"),
                    K(GITPARTY_CONFIG_NEEDED(chalk))
                  ],
                  [startsWith("SyntaxError"), K(CONFIG_NOT_VALID)],
                  [T, I]
                ])
              )
            )
          )
        ]
      ])
    )(
      config || {
        ns: package_default.name
      }
    );
  }
);
var loadGitData = curry4(
  (cancel, chalk, data) => pipe2(
    log.config("searching for .git/index"),
    findUpWithCancel(cancel, {}),
    map2(log.config("git found, path...")),
    map2(path.dirname),
    chain(
      (repo) => repo ? gitlogWithCancel(cancel, { repo }) : rejectF(THIS_IS_NOT_A_GIT_REPO(chalk))
    ),
    map2(pipe2(objOf("gitlog"), mergeRight2(data)))
  )([".git/index"])
);
var adjustRelativeTimezone = curry4((tz, commit) => {
  const { authorDate } = commit;
  const newDate = (tz.toLowerCase() === "utc" ? zonedTimeToUtc : pipe2(zonedTimeToUtc, (x) => utcToZonedTime(x, tz)))(authorDate);
  commit.authorDate = newDate;
  return commit;
});
var deriveAuthor = curry4((lookup, commit) => {
});
var getFiletype = (z) => z.slice(z.indexOf("."), Infinity);
var getFiletypes = (commit) => pipe2(
  propOr([], "files"),
  map2(getFiletype),
  uniq,
  objOf("filetypes"),
  mergeRight2(commit)
)(commit);
var processData = curry4((chalk, config, data) => {
  return pipe2(
    map2(adjustRelativeTimezone(config.timezone)),
    config.excludeMergeCommits ? reject(pipe2(propOr("", "subject"), startsWith("Merge"))) : I,
    map2(getFiletypes),
    map2(
      (raw) => pipe2(
        (x) => [x],
        ap([propOr([], "status"), propOr([], "files")]),
        ([a, z]) => zip(a, z),
        groupBy(head),
        objOf("changes"),
        mergeRight2(raw),
        (z) => mergeRight2(z, { statuses: uniq(z.status) })
      )(raw)
    )
  )(data);
});
var runner = curry4((cancel, argv) => {
  let canon;
  return pipe2(
    (v) => {
      const cwd = process.cwd();
      return configurate(
        YARGS_CONFIG,
        { ...CONFIG_DEFAULTS, repo: cwd, cwd },
        HELP_CONFIG,
        {
          name: $NAME,
          description: $DESC
        },
        v
      );
    },
    map2(log.config("parsed args...")),
    chain((config) => {
      const chalk = new Chalk({ level: config.color ? 2 : 0 });
      return pipe2(
        loadPartyFile(cancel),
        // mash the data together
        map2((partyFile) => ({ config, partyFile, chalk })),
        chain(loadGitData(cancel, chalk))
      )(config);
    }),
    map2(({ config, partyFile, gitlog: gitlog2, chalk }) => {
      canon = canonicalize({});
      return pipe2(
        propOr({}, "patterns"),
        map2(
          (v) => v?.matches ? mergeRight2(v, { fn: chalk[v.color], matches: v.matches }) : v
        ),
        // z => [z],
        printLegend(chalk),
        // ap([printLegend(chalk), processData(chalk, config)])
        (legend) => processData(chalk, config, gitlog2)
      )(partyFile);
    })
  )(argv);
});

// src/cli.js
import { fork } from "fluture";
fork(console.warn)(console.log)(runner(() => {
}, process.argv.slice(2)));
