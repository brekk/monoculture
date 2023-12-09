#!/usr/bin/env node

// src/runner.js
import path from "node:path";
import { parse as parseTime } from "date-fns";
import {
  zonedTimeToUtc,
  utcToZonedTime,
  format as formatDate
} from "date-fns-tz";

// src/per-commit.js
import { values, join, curry, pipe, map, ifElse, always as K } from "ramda";
import mm from "micromatch";
var checkPatternAgainstCommit = curry(
  (commit, pattern) => mm.some(commit.files, pattern.matches)
);
var DASH_DOT = "\u2500\u23FA\u2500";
var applyPatterns = curry(
  (patterns, commit) => pipe(map(checkPatternAgainstCommit(commit)))(patterns)
);
var subrender = curry(
  (yes, or, pattern) => yes ? pattern.fn(` ${pattern.key} `) : or
);
var renderPattern = curry(
  (or, commit, pattern) => ifElse(
    checkPatternAgainstCommit(commit),
    (p) => subrender(true, DASH_DOT, p),
    K(or)
  )(pattern)
);
var renderPatternsWithAlt = curry(
  (alt, patterns, commit) => pipe(values, map(renderPattern(alt, commit)), join(""))(patterns)
);
var renderPatterns = renderPatternsWithAlt(DASH_DOT);

// src/legend.js
import { pipe as pipe2, map as map2, toPairs, curry as curry2, join as join2 } from "ramda";
var legendBlocks = curry2(
  (chalk, x) => pipe2(
    toPairs,
    map2(([k, v]) => `${v.fn(` ${v.key} `)} = ${k}`),
    join2(" ")
  )(x)
);
var printLegend = curry2(
  (chalk, x) => pipe2(legendBlocks(chalk), (y) => `LEGEND: ${y}
`)(x)
);

// src/runner.js
import { trace } from "xtrace";
import { configFileWithCancel, configurate } from "climate";
import { Chalk } from "chalk";
import { strepeat, box, getBorderWidth } from "clox";
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
import strlen from "string-length";
import {
  reduce,
  applySpec,
  F,
  T,
  __ as $,
  always as K2,
  ap,
  join as join3,
  replace,
  chain,
  cond,
  curry as curry5,
  fromPairs,
  groupBy,
  head,
  identity as I,
  includes,
  map as map3,
  mergeRight as mergeRight2,
  objOf,
  pipe as pipe3,
  prop,
  propOr,
  reject,
  split,
  startsWith,
  toPairs as toPairs2,
  uniq,
  zip
} from "ramda";

// src/alias.js
import { curry as curry3, mergeRight } from "ramda";
var alias = curry3((object, from, to) => {
  if (!object[to]) {
    object[to] = from;
  }
  if (!object[from]) {
    object[from] = object[to];
  }
});
var pureAliasedListeners = curry3((subscriber, original, alt, seed) => {
  const emitted = mergeRight(seed, { [alt]: original, [original]: original });
  subscriber(emitted);
  return emitted;
});
var getAliasFrom = curry3(
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
    aliases: ["a", "alias"],
    dateFormat: ["d"],
    width: ["w"],
    fields: ["e"]
  },
  boolean: ["excludeMergeCommits", "collapseAuthors", "init"],
  array: ["aliases", "fields"],
  number: ["width"]
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
  color: true,
  dateFormat: "HH:mm"
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
  aliases: "Define author aliases (useful if authors do not merge under consistent git `user.name`s / `user.email`s)",
  dateFormat: "Express how you want date-fns to format your dates. (default: 'yyyy-MM-dd HH:kk OOOO')",
  width: "Set an explicit width",
  fields: "Specify the fields you want to pull from `gitlog`"
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
import { curry as curry4 } from "ramda";
import GLOG from "gitlog";
import { Future } from "fluture";
var glog = GLOG.default || GLOG;
var NO_OP = () => {
};
var gitlogWithCancel = curry4(
  (cancel, opts) => Future((bad, good) => {
    glog(opts, (e, data) => e ? bad(e) : good(data));
    return cancel;
  })
);
var gitlog = gitlogWithCancel(NO_OP);

// src/log.js
import { complextrace } from "envtrace";
var log = complextrace("gitparty", [
  "config",
  "configFile",
  "info",
  "datetime"
]);

// package.json
var package_default = {
  name: "gitparty",
  version: "0.0.0",
  description: "visualize git logs with magical context \u{1F469}\u{1F3FF}\u200D\u{1F3A8}",
  main: "enscribe.js",
  type: "module",
  repository: "monoculture",
  author: "brekk",
  license: "ISC",
  private: true,
  dependencies: {
    climate: "workspace:packages/climate",
    clox: "workspace:packages/clox",
    "date-fns": "^2.30.0",
    "date-fns-tz": "^2.0.0",
    "file-system": "workspace:packages/file-system",
    fluture: "^14.0.0",
    gitlog: "^4.0.8",
    micromatch: "^4.0.5",
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
var unlines = join3("\n");
var BAR = `\u2502`;
var NEWBAR = `
${BAR}`;
var j2 = (x) => JSON.stringify(x, null, 2);
var { name: $NAME, description: $DESC } = package_default;
var writeInitConfigFileWithCancel = curry5(
  (cancel, filepath) => pipe3(
    j2,
    writeFileWithConfigAndCancel(cancel, { encoding: "utf8" }, filepath),
    map3(K2(`Wrote file to "${filepath}"!`))
  )(DEFAULT_CONFIG_FILE)
);
var getAggregatePatterns = curry5((chalk, partyFile, data) => {
  const aggCommit = reduce(
    (agg, y) => mergeRight2(
      agg,
      mergeRight2(y, { files: uniq((y.files || []).concat(agg.files || [])) })
    ),
    {},
    data
  );
  return renderPatternsWithAlt(
    chalk.inverse("   "),
    partyFile.patterns,
    aggCommit
  );
});
var loadPartyFile = curry5(
  (cancel, { cwd, color: useColor, config, help, HELP, init }) => {
    const chalk = new Chalk({ level: useColor ? 2 : 0 });
    return pipe3(
      cond([
        [
          K2(init),
          () => pipe3(
            writeInitConfigFileWithCancel(cancel),
            swap
          )(path.resolve(cwd, ".gitpartyrc"))
        ],
        [K2(help), K2(resolve(HELP))],
        [
          T,
          pipe3(
            log.configFile("trying to load config..."),
            configFileWithCancel(cancel),
            map3(log.configFile("loaded...")),
            mapRej(
              pipe3(
                log.configFile("error..."),
                propOr("", "message"),
                cond([
                  [
                    includes("No config file found"),
                    K2(GITPARTY_CONFIG_NEEDED(chalk))
                  ],
                  [startsWith("SyntaxError"), K2(CONFIG_NOT_VALID)],
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
var loadGitData = curry5((cancel, config, chalk, data) => {
  const { fields: _fields = [] } = config;
  const fields = [
    ...CONFIG_DEFAULTS.fields,
    ...!Array.isArray(_fields) ? [_fields] : _fields
  ];
  return pipe3(
    log.config("searching for .git/index"),
    findUpWithCancel(cancel, {}),
    map3(log.config("git found, path...")),
    map3(path.dirname),
    chain(
      (repo) => repo ? gitlogWithCancel(cancel, {
        repo,
        number: config.totalCommits,
        fields
      }) : rejectF(THIS_IS_NOT_A_GIT_REPO(chalk))
    ),
    map3(pipe3(objOf("gitlog"), mergeRight2(data)))
  )([".git/index"]);
});
var adjustRelativeTimezone = curry5((timeZone, preferredFormat, commit) => {
  const { authorDate } = commit;
  const newDate = pipe3(
    // 2023-11-21 15:58:44 -0800
    (d) => parseTime(d, "yyyy-MM-dd HH:mm:ss XX", /* @__PURE__ */ new Date()),
    timeZone.toLowerCase() === "utc" ? zonedTimeToUtc : pipe3(zonedTimeToUtc, (x) => utcToZonedTime(x, timeZone)),
    (x) => formatDate(x, preferredFormat, { timeZone })
  )(authorDate);
  commit.formattedDate = newDate;
  return commit;
});
var deriveAuthor = curry5((lookup, commit) => {
});
var getFiletype = (z) => {
  const y = z.slice(z.indexOf(".") + 1);
  const dot = y.lastIndexOf(".");
  return dot > -1 ? y.slice(dot + 1) : y;
};
var getFiletypes = (commit) => pipe3(
  propOr([], "files"),
  map3(getFiletype),
  uniq,
  (z) => z.sort(),
  objOf("filetypes"),
  mergeRight2(commit)
)(commit);
var processData = curry5((chalk, config, data) => {
  return pipe3(
    config.excludeMergeCommits ? reject(pipe3(propOr("", "subject"), startsWith("Merge"))) : I,
    map3(
      pipe3(
        adjustRelativeTimezone(config.timezone, config.dateFormat),
        getFiletypes,
        (commit) => pipe3(
          (x) => [x],
          ap([propOr([], "status"), propOr([], "files")]),
          ([a, z]) => zip(a, z),
          groupBy(head),
          objOf("changes"),
          mergeRight2(commit),
          (z) => mergeRight2(z, { statuses: uniq(z.status) })
        )(commit)
        // applyPatternsWithChalk(chalk, config.patterns.matches
      )
    )
  )(data);
});
var printData = curry5(
  (chalk, partyFile, config, data) => pipe3(
    groupBy(pipe3(prop("authorDate"), split(" "), head)),
    map3(
      applySpec({
        render: pipe3(
          map3((commit) => {
            const {
              filetypes,
              subject,
              authorName,
              abbrevHash,
              formattedDate
            } = commit;
            const matches = renderPatterns(partyFile.patterns, commit);
            return box(
              {
                subtitleAlign: "right",
                width: partyFile.longestSubject,
                padding: {
                  left: 1,
                  right: 1,
                  bottom: 0,
                  top: 0
                },
                subtitle: matches,
                title: `\u25B6 ${chalk.red(
                  authorName
                )} @ ${formattedDate} [${chalk.yellow(abbrevHash)}] \u23F9`
              },
              subject + " | " + chalk.blue(filetypes.join(" "))
            );
          }),
          join3(`

`)
        ),
        pattern: getAggregatePatterns(chalk, partyFile)
      })
    ),
    toPairs2,
    map3(([date, { render: v, pattern: patternSummary }]) => {
      const xxx = strlen(date) + strlen(patternSummary);
      return chalk.inverse(
        " " + date + " " + strepeat(" ")(
          Math.abs(partyFile.longestSubject - xxx) - getBorderWidth(config.borderStyle)
        )
      ) + patternSummary + chalk.inverse("  ") + `${NEWBAR} ${NEWBAR} ` + v.replace(/\n/g, `${NEWBAR} `) + `${NEWBAR} `;
    }),
    join3("\n"),
    replace(/│ ╭/g, "\u251C\u2500\u252C")
  )(data)
);
var processPatterns = curry5(
  (chalk, v) => v?.matches ? mergeRight2(v, {
    fn: Array.isArray(v.color) ? pipe3(
      map3((c) => chalk[c]),
      (x) => (raw) => pipe3.apply(null, x)(raw)
    )(v.color) : chalk[v.color],
    matches: v.matches
  }) : v
);
var runner = curry5((cancel, argv) => {
  let canon;
  return pipe3(
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
    map3(log.config("parsed args...")),
    chain((config) => {
      const chalk = new Chalk({ level: config.color ? 2 : 0 });
      return pipe3(
        loadPartyFile(cancel),
        // mash the data together
        map3((partyFile) => ({ config, partyFile, chalk })),
        chain(loadGitData(cancel, config, chalk))
      )(config);
    }),
    map3(({ config, partyFile, gitlog: gitlog2, chalk }) => {
      canon = canonicalize({});
      return pipe3(
        propOr({}, "patterns"),
        map3(processPatterns(chalk)),
        (patterns) => pipe3(printLegend(chalk), (legend) => {
          const longestSubject = config.width || partyFile.width || pipe3(
            map3(pipe3(propOr("", "subject"), strlen)),
            (z) => Math.max(...z)
          )(gitlog2);
          return pipe3(
            processData(chalk, config),
            printData(
              chalk,
              { ...partyFile, longestSubject, patterns },
              config
            ),
            (z) => legend + "\n" + z
          )(gitlog2);
        })(patterns)
      )(partyFile);
    })
  )(argv);
});

// src/cli.js
import { fork } from "fluture";
fork(console.warn)(console.log)(runner(() => {
}, process.argv.slice(2)));
