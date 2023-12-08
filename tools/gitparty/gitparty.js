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
import { trace as trace2 } from "xtrace";
import { configFileWithCancel, configurate } from "climate";
import { Chalk as Chalk2 } from "chalk";

// src/box.js
import __wrapAnsi from "wrap-ansi";
import { Chalk } from "chalk";
import __ansiAlign from "ansi-align";
import widestLine from "widest-line";
import strlen from "string-length";
import { camelCase } from "camel-case";
import { trace } from "xtrace";
import {
  without,
  __ as $,
  identity as I,
  memoizeWith,
  repeat,
  unless,
  split,
  join as join3,
  reduce,
  always as K2,
  both,
  when,
  propOr,
  map as map3,
  cond,
  curryN,
  equals,
  T,
  curry as curry3,
  pipe as pipe3,
  mergeRight,
  ifElse as ifElse2
} from "ramda";
var ansiWrap = curryN(3, __wrapAnsi);
var ansiAlign = curryN(2, __ansiAlign);
var NEWLINE = "\n";
var lines = split(NEWLINE);
var unlines = join3(NEWLINE);
var PAD = " ";
var NONE = "none";
var terminalColumns = () => {
  const { env, stdout, stderr } = process;
  return env.COLUMNS ? Number.parseInt(env.COLUMNS, 10) : stdout?.columns ? stdout.columns : stderr?.columns ? stderr.columns : 80;
};
var isType = curry3((y, x) => typeof x === y);
var objectify = ifElse2(
  isType("number"),
  (top) => ({
    top,
    right: top * 3,
    bottom: top,
    left: top * 3
  }),
  mergeRight({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  })
);
var getBorderWidth = (s) => s === NONE ? 0 : 2;
var isOdd = (x) => x % 2 === 1;
var makeTitle = (text, horizontal, alignment) => {
  const textWidth = strlen(text);
  return pipe3(
    cond([
      [equals("left"), () => text + horizontal.slice(textWidth)],
      [equals("right"), () => horizontal.slice(textWidth) + text],
      [
        T,
        () => {
          horizontal = horizontal.slice(textWidth);
          if (isOdd(strlen(horizontal))) {
            horizontal = horizontal.slice(Math.floor(strlen(horizontal) / 2));
            return horizontal.slice(1) + text + horizontal;
          } else {
            horizontal = horizontal.slice(strlen(horizontal) / 2);
            return horizontal + text + horizontal;
          }
        }
      ]
    ])
  )(alignment);
};
var enpad = curry3(
  ({ align, max, longest }, i) => align === "center" ? repad((max - longest) / 2) + i : align === "right" ? repad(max - longest) + i : i
);
var addNewLines = curry3(
  (max, align, lx) => reduce(
    (newLines, line) => {
      const paddedLines = pipe3(
        ansiWrap($, max, { hard: true }),
        ansiAlign($, { align }),
        lines,
        (processedLines) => pipe3(
          map3(strlen),
          (x) => Math.max(...x),
          (longest) => map3(enpad({ align, max, longest }))(processedLines)
        )(processedLines)
      )(line);
      return newLines.concat(paddedLines);
    },
    [],
    lx
  )
);
var realign = curry3(
  ({ max, textWidth }, align, linex) => map3(
    (line) => align === "center" ? repad((max - textWidth) / 2) + line : align === "right" ? repad(max - textWidth) + line : line
  )(linex)
);
var makeContentText = (text, { padding, width, align, height }) => {
  text = ansiAlign(text, { align });
  let linex = text.split(NEWLINE);
  const textWidth = widestLine(text);
  const max = width - padding.left - padding.right;
  linex = textWidth > max ? addNewLines(max, align, linex) : textWidth < max ? realign({ max, textWidth }, align, linex) : linex;
  const [pl, pr] = map3(repad)([padding.left, padding.right]);
  linex = linex.map((line) => {
    const l2 = pl + line + pr;
    return l2 + repad(width - strlen(l2));
  });
  if (padding.top > 0) {
    linex = [
      ...Array.from({ length: padding.top }).fill(repad(width)),
      ...linex
    ];
  }
  if (padding.bottom > 0) {
    linex = [
      ...linex,
      ...Array.from({ length: padding.bottom }).fill(repad(width))
    ];
  }
  if (height) {
    if (linex.length > height) {
      linex = linex.slice(0, height);
    } else if (linex.length < height) {
      linex = [
        ...linex,
        ...Array.from({ length: height - linex.length }).fill(repad(width))
      ];
    }
  }
  return linex.join(NEWLINE);
};
var colorizeBorder = curry3((options, border) => {
  const { chalk } = options;
  const newBorder = options.borderColor ? getColorFn(options.borderColor)(border) : border;
  return options.dimBorder ? chalk.dim(newBorder) : newBorder;
});
var colorizeContent = curry3(
  (options, content) => options.backgroundColor ? getBGColorFn(options.chalk, options.backgroundColor)(content) : content
);
var minimumEdge = curry3(
  (field, ox) => when(propOr(false, field), (o) => {
    o[field] = Math.max(1, o[field] - getBorderWidth(o.borderStyle));
    return o;
  })(ox)
);
var sanitizeOptions = pipe3(
  when(
    both(propOr(false, "fullscreen"), () => process?.stdout),
    (o) => {
      const sto = process.stdout;
      const rawDimensions = [sto.columns, sto.rows];
      const newDimensions = isType("function", o.fullscreen) ? o.fullscreen(rawDimensions) : rawDimensions;
      const [cols, rows] = newDimensions;
      if (!o.width) {
        o.width = cols;
      }
      if (!o.height) {
        o.height = rows;
      }
      return o;
    }
  ),
  minimumEdge("width"),
  minimumEdge("height")
);
var formatWithPointer = curry3(
  (char, selector, { [selector]: title, borderStyle, padTitle, chars }) => borderStyle === NONE ? title : padTitle ? ` ${title} ` : `${chars[char]}${title}${chars[char]}`
);
var formatTitle = formatWithPointer("top", "title");
var formatSubTitle = formatWithPointer("bottom", "subtitle");
var ensurePositive = (z) => z < 0 ? 0 : z;
var strepeat = (toRepeat) => memoizeWith(I, (n) => pipe3(ensurePositive, repeat(toRepeat), join3(""))(n));
var repad = strepeat(PAD);
var getLeftMarginByAlignment = curry3(
  (columns, contentWidth, { borderStyle, margin, float }) => float === "center" ? repad(
    Math.max(
      (columns - contentWidth - getBorderWidth(borderStyle)) / 2,
      0
    )
  ) : float === "right" ? repad(
    Math.max(
      columns - contentWidth - margin.right - getBorderWidth(borderStyle),
      0
    )
  ) : repad(margin.left)
);
var reline = strepeat(NEWLINE);
var processContent = (raw) => reduce(
  (agg, [pred, run]) => ifElse2(
    pred,
    pipe3(run, (y) => agg + y),
    K2(agg)
  )(raw),
  "",
  [
    [({ margin }) => margin.top, ({ margin }) => reline(margin.top)],
    [
      ({ borderStyle, title }) => borderStyle !== NONE || title,
      (opts) => {
        const { marginLeft, contentWidth, title, chars, align, titleAlign } = opts;
        const retop = strepeat(chars.top);
        return colorizeBorder(
          opts,
          marginLeft + chars.topLeft + (title ? makeTitle(title, retop(contentWidth), titleAlign) : retop(contentWidth)) + chars.topRight
        ) + NEWLINE;
      }
    ],
    [
      ({ content }) => lines(content).length > 0,
      (opts) => {
        const { marginLeft, chars, content } = opts;
        return pipe3(
          lines,
          map3(
            (line) => marginLeft + colorizeBorder(opts, chars.left) + colorizeContent(opts, line) + colorizeBorder(opts, chars.right)
          ),
          unlines,
          (z) => z + NEWLINE
        )(content);
      }
    ],
    [
      ({ subtitle, borderStyle }) => subtitle || borderStyle !== NONE,
      (opts) => {
        const {
          marginLeft,
          contentWidth,
          subtitle,
          chars,
          align,
          subtitleAlign
        } = opts;
        const rebottom = strepeat(chars.bottom);
        return colorizeBorder(
          opts,
          marginLeft + chars.bottomLeft + (subtitle ? makeTitle(subtitle, rebottom(contentWidth), subtitleAlign) : rebottom(contentWidth)) + chars.bottomRight
        );
      }
    ],
    [({ margin }) => margin.bottom, ({ margin }) => reline(margin.bottom)]
  ]
);
var boxContent = (content, contentWidth, opts) => {
  const columns = terminalColumns();
  const marginLeft = getLeftMarginByAlignment(columns, contentWidth, opts);
  return processContent({ marginLeft, contentWidth, content, ...opts });
};
var noverflow = curry3(
  (what, dim, edges, opts) => pipe3(
    when(
      (o) => {
        const pads = reduce((agg, x) => agg + opts[what][x], 0, edges);
        return o[dim] - pads <= 0;
      },
      (o) => reduce(
        (agg, edge) => {
          agg[what][edge] = 0;
          return agg;
        },
        o,
        edges
      )
    )
  )(opts)
);
var noPaddingOverflow = noverflow("padding");
var handlePadding = pipe3(
  noPaddingOverflow("width", ["left", "right"]),
  noPaddingOverflow("height", ["top", "bottom"])
);
var retitle = curry3((w, title, formatter, opts) => {
  const cut = Math.max(0, w - 2);
  return cut ? formatter(opts) : opts;
});
var handleKeyedTitle = curry3(
  (key, formatter, { maxWidth, widest }, adjustTitle, opts) => {
    const { [key]: title } = opts;
    if (title) {
      if (adjustTitle) {
        opts[key] = retitle(opts.width, title, formatter, opts);
      } else {
        opts[key] = retitle(maxWidth, title, formatter, opts);
        if (strlen(opts[key]) > widest) {
          opts.width = strlen(opts[key]);
        }
      }
    }
    return opts;
  }
);
var handleTitle = handleKeyedTitle("title", formatTitle);
var handleSubTitle = handleKeyedTitle("subtitle", formatSubTitle);
var boundMargin = curry3(
  (m, x) => pipe3(Math.floor, (z) => Math.max(0, z))(x * m)
);
var handleMargin = curry3(
  ({ maxWidth, borderWidth, columns }, rewire, opts) => unless(
    () => rewire,
    pipe3(
      when(
        ({ margin, width }) => margin.left && margin.right && width > maxWidth,
        (o) => {
          const { width, margin } = o;
          const spaceForMargins = columns - width - borderWidth;
          const m = spaceForMargins / (margin.left + margin.right);
          const enmargin = boundMargin(m);
          o.margin.left = enmargin(margin.left);
          o.margin.right = enmargin(margin.right);
          return o;
        }
      ),
      ({ width, margin, ...o }) => ({
        ...o,
        margin,
        width: Math.min(
          width,
          columns - borderWidth - margin.left - margin.right
        )
      })
    )
  )(opts)
);
var size = curry3((p, t) => widestLine(t) + p);
var determineDimensions = (text, opts) => {
  opts = sanitizeOptions(opts);
  const explicitWidth = !!opts.width;
  const { margin, padding, title = "", subtitle = "" } = opts;
  const columns = terminalColumns();
  const borderWidth = getBorderWidth(opts.borderStyle);
  const maxWidth = columns - margin.left - margin.right - borderWidth;
  const sidepadding = padding.left + padding.right;
  const wrapped = ansiWrap(text, columns - borderWidth, {
    hard: true,
    trim: false
  });
  const sizes = map3(size(sidepadding), [wrapped, title, subtitle]);
  const _widest = Math.max(...sizes);
  const secondWidest = Math.max(...without([_widest], sizes));
  const widest = !opts.__autoSize__ ? _widest : _widest - secondWidest <= borderWidth + 2 ? secondWidest : _widest;
  const dimensionalData = { maxWidth, borderWidth, columns, widest };
  return pipe3(
    handleTitle(dimensionalData, explicitWidth),
    handleSubTitle(dimensionalData, explicitWidth),
    (o) => {
      o.width = o.width ? o.width : widest;
      return o;
    },
    handleMargin(dimensionalData, !explicitWidth),
    handlePadding
  )(opts);
};
var isHex = (color) => color.match(/^#(?:[0-f]{3}){1,2}$/i);
var isChalkColorValid = curry3(
  (chalk, color) => typeof color === "string" && (chalk[color] ?? isHex(color))
);
var getColorFn = curry3(
  (chalk, color) => isHex(color) ? chalk.hex(color) : chalk[color]
);
var getBGColorFn = curry3(
  (chalk, color) => isHex(color) ? chalk.bgHex(color) : chalk[camelCase(["bg", color])]
);
var ensureValidColor = curry3((chalk, key, color) => {
  if (color && !isChalkColorValid(chalk, color)) {
    throw new Error(`${color} is not a valid ${key}`);
  }
});
var DEFAULT_OPTIONS = {
  color: true,
  padding: 0,
  borderStyle: "single",
  dimBorder: false,
  float: "left",
  align: "left",
  titleAlign: "left",
  subtitleAlign: "left",
  chars: {
    top: "\u2500",
    left: "\u2502",
    right: "\u2502",
    bottom: "\u2500",
    topLeft: "\u256D",
    topRight: "\u256E",
    bottomLeft: "\u2570",
    bottomRight: "\u256F"
  },
  padTitle: false
};
var box = curry3((opts, text) => {
  opts = mergeRight(DEFAULT_OPTIONS)(opts);
  const chalk = new Chalk({ level: opts.color ? 2 : 0 });
  opts.chalk = chalk;
  ensureValidColor(chalk, "borderColor", opts.borderColor);
  ensureValidColor(chalk, "backgroundColor", opts.backgroundColor);
  opts.padding = objectify(opts.padding);
  opts.margin = objectify(opts.margin);
  opts = determineDimensions(text, opts);
  text = makeContentText(text, opts);
  return boxContent(text, opts.width, opts);
});

// src/runner.js
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
import strlen2 from "string-length";
import {
  reduce as reduce2,
  applySpec,
  F,
  T as T2,
  __ as $2,
  always as K3,
  ap,
  join as join4,
  replace,
  chain,
  cond as cond2,
  curry as curry6,
  fromPairs,
  groupBy,
  head,
  identity as I2,
  includes,
  map as map4,
  mergeRight as mergeRight3,
  objOf,
  pipe as pipe4,
  prop,
  propOr as propOr2,
  reject,
  split as split2,
  startsWith,
  toPairs as toPairs2,
  uniq,
  zip
} from "ramda";

// src/alias.js
import { curry as curry4, mergeRight as mergeRight2 } from "ramda";
var alias = curry4((object, from, to) => {
  if (!object[to]) {
    object[to] = from;
  }
  if (!object[from]) {
    object[from] = object[to];
  }
});
var pureAliasedListeners = curry4((subscriber, original, alt, seed) => {
  const emitted = mergeRight2(seed, { [alt]: original, [original]: original });
  subscriber(emitted);
  return emitted;
});
var getAliasFrom = curry4(
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
import { curry as curry5 } from "ramda";
import GLOG from "gitlog";
import { Future } from "fluture";
var glog = GLOG.default || GLOG;
var NO_OP = () => {
};
var gitlogWithCancel = curry5(
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
  description: "A party for your git log",
  main: "enscribe.js",
  type: "module",
  repository: "monoculture",
  author: "brekk",
  license: "ISC",
  private: true,
  dependencies: {
    "ansi-align": "^3.0.1",
    "camel-case": "^5.0.0",
    climate: "workspace:packages/climate",
    "date-fns": "^2.30.0",
    "date-fns-tz": "^2.0.0",
    "file-system": "workspace:packages/file-system",
    fluture: "^14.0.0",
    gitlog: "^4.0.8",
    micromatch: "^4.0.5",
    ramda: "^0.29.1",
    "string-length": "^6.0.0",
    "widest-line": "^5.0.0",
    "wrap-ansi": "^9.0.0"
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
var unlines2 = join4("\n");
var BAR = `\u2502`;
var NEWBAR = `
${BAR}`;
var j2 = (x) => JSON.stringify(x, null, 2);
var { name: $NAME, description: $DESC } = package_default;
var writeInitConfigFileWithCancel = curry6(
  (cancel, filepath) => pipe4(
    j2,
    writeFileWithConfigAndCancel(cancel, { encoding: "utf8" }, filepath),
    map4(K3(`Wrote file to "${filepath}"!`))
  )(DEFAULT_CONFIG_FILE)
);
var getAggregatePatterns = curry6((chalk, partyFile, data) => {
  const aggCommit = reduce2(
    (agg, y) => mergeRight3(
      agg,
      mergeRight3(y, { files: uniq((y.files || []).concat(agg.files || [])) })
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
var loadPartyFile = curry6(
  (cancel, { cwd, color: useColor, config, help, HELP, init }) => {
    const chalk = new Chalk2({ level: useColor ? 2 : 0 });
    return pipe4(
      cond2([
        [
          K3(init),
          () => pipe4(
            writeInitConfigFileWithCancel(cancel),
            swap
          )(path.resolve(cwd, ".gitpartyrc"))
        ],
        [K3(help), K3(resolve(HELP))],
        [
          T2,
          pipe4(
            log.configFile("trying to load config..."),
            configFileWithCancel(cancel),
            map4(log.configFile("loaded...")),
            mapRej(
              pipe4(
                log.configFile("error..."),
                propOr2("", "message"),
                cond2([
                  [
                    includes("No config file found"),
                    K3(GITPARTY_CONFIG_NEEDED(chalk))
                  ],
                  [startsWith("SyntaxError"), K3(CONFIG_NOT_VALID)],
                  [T2, I2]
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
var loadGitData = curry6((cancel, config, chalk, data) => {
  const { fields: _fields = [] } = config;
  const fields = [
    ...CONFIG_DEFAULTS.fields,
    ...!Array.isArray(_fields) ? [_fields] : _fields
  ];
  return pipe4(
    log.config("searching for .git/index"),
    findUpWithCancel(cancel, {}),
    map4(log.config("git found, path...")),
    map4(path.dirname),
    chain(
      (repo) => repo ? gitlogWithCancel(cancel, {
        repo,
        number: config.totalCommits,
        fields
      }) : rejectF(THIS_IS_NOT_A_GIT_REPO(chalk))
    ),
    map4(pipe4(objOf("gitlog"), mergeRight3(data)))
  )([".git/index"]);
});
var adjustRelativeTimezone = curry6((timeZone, preferredFormat, commit) => {
  const { authorDate } = commit;
  const newDate = pipe4(
    // 2023-11-21 15:58:44 -0800
    (d) => parseTime(d, "yyyy-MM-dd HH:mm:ss XX", /* @__PURE__ */ new Date()),
    timeZone.toLowerCase() === "utc" ? zonedTimeToUtc : pipe4(zonedTimeToUtc, (x) => utcToZonedTime(x, timeZone)),
    (x) => formatDate(x, preferredFormat, { timeZone })
  )(authorDate);
  commit.formattedDate = newDate;
  return commit;
});
var deriveAuthor = curry6((lookup, commit) => {
});
var getFiletype = (z) => {
  const y = z.slice(z.indexOf(".") + 1);
  const dot = y.lastIndexOf(".");
  return dot > -1 ? y.slice(dot + 1) : y;
};
var getFiletypes = (commit) => pipe4(
  propOr2([], "files"),
  map4(getFiletype),
  uniq,
  (z) => z.sort(),
  objOf("filetypes"),
  mergeRight3(commit)
)(commit);
var processData = curry6((chalk, config, data) => {
  return pipe4(
    config.excludeMergeCommits ? reject(pipe4(propOr2("", "subject"), startsWith("Merge"))) : I2,
    map4(
      pipe4(
        adjustRelativeTimezone(config.timezone, config.dateFormat),
        getFiletypes,
        (commit) => pipe4(
          (x) => [x],
          ap([propOr2([], "status"), propOr2([], "files")]),
          ([a, z]) => zip(a, z),
          groupBy(head),
          objOf("changes"),
          mergeRight3(commit),
          (z) => mergeRight3(z, { statuses: uniq(z.status) })
        )(commit)
        // applyPatternsWithChalk(chalk, config.patterns.matches
      )
    )
  )(data);
});
var printData = curry6(
  (chalk, partyFile, config, data) => pipe4(
    groupBy(pipe4(prop("authorDate"), split2(" "), head)),
    map4(
      applySpec({
        render: pipe4(
          map4((commit) => {
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
          join4(`

`)
        ),
        pattern: getAggregatePatterns(chalk, partyFile)
      })
    ),
    toPairs2,
    map4(([date, { render: v, pattern: patternSummary }]) => {
      const xxx = strlen2(date) + strlen2(patternSummary);
      return chalk.inverse(
        " " + date + " " + strepeat(" ")(
          Math.abs(partyFile.longestSubject - xxx) - getBorderWidth(config.borderStyle)
        )
      ) + patternSummary + chalk.inverse("  ") + `${NEWBAR} ${NEWBAR} ` + v.replace(/\n/g, `${NEWBAR} `) + `${NEWBAR} `;
    }),
    join4("\n"),
    replace(/│ ╭/g, "\u251C\u2500\u252C")
  )(data)
);
var processPatterns = curry6(
  (chalk, v) => v?.matches ? mergeRight3(v, {
    fn: Array.isArray(v.color) ? pipe4(
      map4((c) => chalk[c]),
      (x) => (raw) => pipe4.apply(null, x)(raw)
    )(v.color) : chalk[v.color],
    matches: v.matches
  }) : v
);
var runner = curry6((cancel, argv) => {
  let canon;
  return pipe4(
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
    map4(log.config("parsed args...")),
    chain((config) => {
      const chalk = new Chalk2({ level: config.color ? 2 : 0 });
      return pipe4(
        loadPartyFile(cancel),
        // mash the data together
        map4((partyFile) => ({ config, partyFile, chalk })),
        chain(loadGitData(cancel, config, chalk))
      )(config);
    }),
    map4(({ config, partyFile, gitlog: gitlog2, chalk }) => {
      canon = canonicalize({});
      return pipe4(
        propOr2({}, "patterns"),
        map4(processPatterns(chalk)),
        (patterns) => pipe4(printLegend(chalk), (legend) => {
          const longestSubject = config.width || partyFile.width || pipe4(
            map4(pipe4(propOr2("", "subject"), strlen2)),
            (z) => Math.max(...z)
          )(gitlog2);
          return pipe4(
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
