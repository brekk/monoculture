#!/usr/bin/env node

// src/plugin.js
import {
  equals as equals3,
  identity as I3,
  map as map5,
  pipe as pipe5,
  propOr as propOr2,
  reject as reject3,
  replace as replace4,
  split as split2,
  startsWith as startsWith2,
  trim
} from "ramda";

// src/tuple.js
import { curry, pipe, map, reject, any } from "ramda";
var snd = ([, v]) => v;
var tupleValueTransform = curry((fn, [k, v]) => [k, fn(v)]);
var tupleTransform = curry(
  (hoc, fn, list) => hoc(tupleValueTransform(fn), list)
);
var applySecond = curry(
  (hoc, fn, list) => hoc(pipe(tupleValueTransform(fn), snd), list)
);
var mapSnd = tupleTransform(map);
var rejectSnd = applySecond(reject);
var anySnd = applySecond(any);

// src/reporter.js
import H2 from "chalk";
import {
  addIndex,
  curry as curry4,
  descend,
  join as join2,
  last,
  map as map3,
  pipe as pipe3,
  reduce as reduce2,
  replace,
  sortWith,
  toPairs as toPairs2,
  zip,
  length as length2
} from "ramda";

// src/regex.js
var makeRegexFromArray = (x) => new RegExp(`\\b${x.join("\\b|\\b")}\\b`, "g");

// src/constants.js
var TS_KEYWORDS = [
  "any",
  "boolean",
  "string",
  "number",
  "interface",
  "type"
];
var JS_KEYWORDS = [
  "Error",
  "switch",
  "case",
  "class",
  "as",
  "async",
  "await",
  "catch",
  "children",
  "const",
  "default",
  "else",
  "export",
  "for",
  "forEach",
  "from",
  "function",
  "if",
  "import",
  "length",
  "let",
  "map",
  "null",
  "push",
  "reduce",
  "return",
  "then",
  "this",
  "try",
  "undefined",
  "var",
  "while",
  "extends",
  "new"
];
var RG_JS_KEYWORDS = makeRegexFromArray(JS_KEYWORDS);
var RG_TS_KEYWORDS = makeRegexFromArray(TS_KEYWORDS);
var SOURCE_CODE_NOISE = /[\$\!\|;:\.%\[\]<>,\=\)\(\}\{&\?\d]/g;

// src/trace.js
import { curry as curry2 } from "ramda";
var trace = curry2((a, b) => {
  console.log(a, b);
  return b;
});

// src/config.js
import {
  __ as $,
  propOr,
  ap,
  concat,
  curry as curry3,
  equals,
  filter,
  identity as I,
  ifElse,
  join,
  map as map2,
  mergeRight,
  objOf,
  of,
  pipe as pipe2,
  prop,
  reduce,
  length,
  toPairs
} from "ramda";
import H from "chalk";
var LOGO = `   /\\/\\
 .======.
<dIIIIIIb>
 |[${H.red("o")}><${H.red("o")}]| 
 ${H.cyan("(||||||)")}
 |______|
`;
var CONFIG = {
  alias: {
    help: ["h"],
    fun: ["f"],
    limit: ["l"],
    ignore: ["i"],
    ignoreTokens: ["t"],
    skipWords: ["w"],
    dropStrings: ["s"],
    histogramMinimum: ["hits", "m"],
    assumeSimilarWords: ["similar", "a"],
    dropJSKeywords: ["j"],
    dropTSKeywords: ["J"]
  },
  array: ["skipWords", "ignoreTokens", "ignore"],
  boolean: [
    "dropStrings",
    "assumeSimilarWords",
    "dropJSKeywords",
    "dropTSKeywords",
    "fun"
  ],
  number: ["histogramMinimum"],
  configuration: { "strip-aliased": true }
};
var HELP_CONFIG = {
  help: "This text!",
  fun: "Show the robot",
  limit: "What top number of words do you want to see? (default: Infinity)",
  skipWords: "Ignore a given word (this should be merged with --ignore)",
  ignore: "Ignore a matched string (can be specified multiple times)",
  ignoreTokens: "Ignore a token once it is processed (more reliable than `--ignore`)",
  dropStrings: "Should strings be retained or removed?",
  histogramMinimum: "What is the minimum number of matches as a threshold?",
  assumeSimilarWords: "Should we attempt to infer whether words are similar?",
  dropJSKeywords: "Should JS keywords be dropped? (default: true)",
  dropTSKeywords: "Should TS keywords be dropped? (default: true)"
};
var shortFlag = (z) => `-${z}`;
var longFlag = (z) => `--${z}`;
var invalidHelpConfig = (key) => {
  throw new Error(`You must add a ${key} key to HELP_CONFIG!`);
};
var failIfMissingFlag = curry3(
  (env, k, raw) => env !== "production" && raw === "???" ? invalidHelpConfig(k) : raw
);
var HELP = pipe2(
  propOr({}, "alias"),
  toPairs,
  map2(
    ([k, v]) => pipe2(
      (z) => [z],
      ap([
        pipe2(
          (z) => [z],
          concat(v),
          map2(ifElse(pipe2(length, equals(1)), shortFlag, longFlag)),
          join(" / ")
        ),
        pipe2(
          propOr("???", $, HELP_CONFIG),
          failIfMissingFlag(process.env.NODE_ENV, k)
        )
      ]),
      ([flags, description]) => `${flags}
  ${description}`
    )(k)
  ),
  join("\n\n"),
  (z) => `robot-tourist
${LOGO}
${z}`
)(CONFIG);

// src/reporter.js
var getWords = pipe3(
  toPairs2,
  // sortBy(pipe(last, length, z => z * -1)),
  map3(([word, _lines]) => {
    const count = length2(_lines);
    return ` - ${H2.red(word)} (${count} reference${count === 0 || count > 1 ? "s" : ""})`;
  }),
  join2("\n")
);
var summarize = pipe3(
  toPairs2,
  // sortBy(pipe(last, length, z => z * -1)),
  addIndex(map3)(
    ([word, _lines], i) => `${i + 1}. ${H2.red(word)}
   on ${H2.blue("lines")}: ${_lines.join(", ")}`
  ),
  join2("\n")
);
var robotTouristReporter = curry4(
  ($wordlimit, $fun, { file: f, report, words: w }) => `${$fun ? "\n" + LOGO + "\n\n" : ""}SCANNED: ${f}
The ${$wordlimit !== Infinity ? $wordlimit + " " : ""}most common words in this file are:
${getWords(report)}
These words were found in this pattern:
${summarize(report)}
`
);
var dropJSKeywords = mapSnd(replace(RG_JS_KEYWORDS, ""));
var dropTSKeywords = mapSnd(replace(RG_TS_KEYWORDS, ""));
var dropUserDefinedValues = curry4(
  (skippable, x) => mapSnd(replace(skippable, ""))(x)
);
var createEntities = curry4(
  (file, raw) => reduce2(
    (agg, { line, content, classification }) => ({
      ...agg,
      lines: [...agg.lines, { line, content, classification }],
      entities: pipe3(zip(classification), (merged) => [
        ...agg.entities,
        ...merged
      ])(content)
    }),
    { file, lines: [], entities: [] }
  )(raw)
);

// src/source-matcher.js
import { anyPass, includes, replace as replace2 } from "ramda";
var evidenceOfImports = anyPass([
  includes("from"),
  includes("require"),
  includes("import")
]);
var replaceNoise = replace2(SOURCE_CODE_NOISE, " ");

// src/string.js
import {
  __ as $2,
  always as K,
  anyPass as anyPass2,
  both,
  chain,
  cond,
  curry as curry5,
  descend as descend2,
  either,
  endsWith,
  equals as equals2,
  filter as filter2,
  fromPairs,
  groupBy,
  head,
  identity as I2,
  includes as includes2,
  isEmpty,
  keys,
  last as last2,
  map as map4,
  pipe as pipe4,
  reduce as reduce3,
  reject as reject2,
  replace as replace3,
  slice,
  sortWith as sortWith2,
  split,
  startsWith,
  toLower,
  toPairs as toPairs3,
  uniq,
  values,
  when
} from "ramda";
import * as CC from "change-case";
import { stemmer } from "stemmer";
var matchesCaseFormat = curry5((formatter, x) => formatter(x) === x);
var classify = cond([
  [anyPass2([includes2('"'), includes2("'"), includes2("`")]), K("string")],
  [matchesCaseFormat(CC.constantCase), K("constant")],
  [both(includes2("-"), matchesCaseFormat(CC.paramCase)), K("param")],
  [matchesCaseFormat(CC.pascalCase), K("proper")],
  [both(includes2("/"), matchesCaseFormat(CC.pathCase)), K("path")],
  [both((z) => toLower(z) !== z, matchesCaseFormat(CC.camelCase)), K("content")],
  [K(true), K("text")]
]);
var cleanups = anyPass2([
  equals2(""),
  equals2("*"),
  startsWith("/"),
  startsWith("```")
]);
var getWordsFromEntities = curry5(
  (infer, skippables, raw) => pipe4(
    map4(map4(CC.noCase)),
    values,
    reduce3((agg, x) => [...agg, ...x], []),
    chain(split(" ")),
    map4(toLower),
    reject2(includes2($2, skippables)),
    infer ? map4(stemmer) : I2,
    (z) => z.sort()
  )(raw)
);
var parseWords = ({ limit, skip, entities, minimum, infer = true }) => pipe4(
  getWordsFromEntities(infer, skip),
  reduce3((agg, x) => {
    const y = infer ? stemmer(x) : x;
    const current = agg[y] || 0;
    agg[y] = current + 1;
    return agg;
  }, {}),
  minimum > 0 ? filter2((z) => z > minimum) : I2,
  toPairs3,
  sortWith2([descend2(last2)]),
  slice(0, limit),
  fromPairs
)(entities);
var compareContentToWords = curry5((infer, line, content, _words) => {
  if (isEmpty(content) || isEmpty(_words))
    return false;
  const cleancontent = pipe4(
    map4(CC.noCase),
    chain(split(" ")),
    infer ? map4(stemmer) : I2,
    uniq
  )(content);
  return reduce3(
    (agg, word) => {
      if (agg.matched) {
        return agg;
      }
      const stem = infer ? stemmer(word) : word;
      const matched = includes2(stem, cleancontent);
      if (matched) {
        return { matched, relationships: [...agg.relationships, [line, word]] };
      }
      return agg;
    },
    { matched: false, relationships: [] },
    keys(_words)
  );
});
var correlate = curry5(
  (infer, _words, _lines) => pipe4(
    reduce3((agg, { line, content }) => {
      const compared = compareContentToWords(infer, line, content, _words);
      return compared.matched ? [...agg, compared.relationships] : agg;
    }, []),
    map4(head),
    groupBy(last2),
    map4(map4(head))
  )(_lines)
);
var dropMultilineComments = reduce3(
  (agg, [k, v]) => {
    const commenting = agg.commentMode;
    const commentEnds = either(endsWith("*/"), includes2("*/"))(v);
    const commentStarts = either(startsWith("/*"), includes2("/*"))(v);
    return commenting && !commentEnds ? agg : !commenting && commentStarts ? { commentMode: true, stack: agg.stack } : { commentMode: false, stack: [...agg.stack, [k, v]] };
  },
  { stack: [], commentMode: false }
);
var dropImports = when(
  anySnd(evidenceOfImports),
  pipe4(
    reduce3(
      (agg, line) => evidenceOfImports(line[1]) ? agg : [...agg, line],
      []
    )
  )
);
var dropStrings = mapSnd(
  pipe4(replace3(/".*"/g, ""), replace3(/'.*'/g, ""), replace3(/`.*`/g, ""))
);
var cleanEntities = ({ entities, ...x }) => ({
  ...x,
  entities: pipe4(
    groupBy(head),
    map4(map4(last2)),
    map4(uniq),
    map4((z) => z.sort())
  )(entities)
});

// src/plugin.js
var plugin = ({
  fun: $fun,
  file: $file,
  limit: $wordlimit,
  ignore: $ignore,
  skipWords: $skipWords,
  dropStrings: $dropStrings,
  histogramMinimum: $hMin,
  assumeSimilarWords: $similarWords,
  dropJSKeywords: $dropJS,
  dropTSKeywords: $dropTS
}, file) => pipe5(
  // throw away single line comments
  rejectSnd(startsWith2("//")),
  // throw away multi line comments
  dropMultilineComments,
  // grab the stack from that process
  propOr2([], "stack"),
  // clean up some stuff we missed
  rejectSnd(equals3("*/")),
  // we don't care about the imports, that's all stuff upstream from this file
  dropImports,
  // throw away strings, we don't care about them* - now configurable
  $dropStrings ? dropStrings : I3,
  // apply some radical cleanups to text
  mapSnd(pipe5(replaceNoise, trim)),
  // if it's JS we don't care
  $dropJS ? dropJSKeywords : I3,
  $dropTS ? dropTSKeywords : I3,
  // if it's stuff we said we don't care about, we don't care!
  dropUserDefinedValues($ignore),
  // do another round of cleanup, convert to array of words
  mapSnd(pipe5(trim, replace4(/\s\s+/g, " "), split2(" "), reject3(cleanups))),
  // no content, throw it away
  reject3(([, v]) => v.length === 0),
  // convert to object
  map5(([line, content]) => ({
    line,
    content,
    classification: map5(classify)(content)
  })),
  // do some secondary logic now that we have classification
  createEntities($file),
  // clean up entities to be more useful
  cleanEntities,
  // produce words in a histogram (and throw away anything which only occurs once)
  ({ entities, ...x }) => ({
    ...x,
    entities,
    words: parseWords({
      limit: $wordlimit,
      skip: $skipWords,
      entities,
      minimum: $hMin,
      infer: $similarWords
    })
  }),
  ({ words: w, lines: l, ...x }) => {
    const report = correlate($similarWords, w, l);
    return { ...x, lines: l, words: w, report };
  },
  robotTouristReporter($wordlimit, $fun)
)(file);

// src/index.js
var src_default = plugin;
export {
  src_default as default
};
