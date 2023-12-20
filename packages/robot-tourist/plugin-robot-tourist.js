// src/core.js
import {
  equals as equals2,
  mergeRight as mergeRight2,
  curry as curry5,
  identity as I2,
  map as map4,
  pipe as pipe4,
  reject as reject3,
  replace as replace4,
  split as split2,
  startsWith as startsWith2,
  trim
} from "ramda";
import { trace as trace2 } from "xtrace";
import yargsParser from "yargs-parser";

// src/stats.js
import { curry as curry3 } from "ramda";

// src/string.js
import { trace } from "xtrace";
import {
  prop,
  __ as $,
  always as K,
  anyPass as anyPass2,
  both,
  chain,
  cond,
  curry as curry2,
  descend,
  either,
  endsWith,
  equals,
  filter,
  fromPairs,
  groupBy,
  head,
  identity as I,
  includes as includes2,
  isEmpty,
  keys,
  last,
  map as map2,
  pipe as pipe2,
  reduce,
  reject as reject2,
  replace as replace2,
  slice,
  sortWith,
  split,
  startsWith,
  toLower,
  toPairs,
  uniq,
  values,
  when
} from "ramda";
import {
  camelCase,
  constantCase,
  pascalCase,
  pathCase,
  kebabCase as paramCase,
  noCase
} from "change-case";
import { stemmer } from "stemmer";

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

// src/source-matcher.js
import { anyPass, includes, replace } from "ramda";

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
var SOURCE_CODE_NOISE = /[\+\$\!\|;:\.%\[\]<>,\=\)\(\}\{&\?\d]/gs;

// src/source-matcher.js
var evidenceOfImports = anyPass([
  includes("from"),
  includes("require"),
  includes("import")
]);
var replaceNoise = replace(SOURCE_CODE_NOISE, " ");

// src/string.js
var matchesCaseFormat = curry2((formatter, x) => formatter(x) === x);
var classify = cond([
  [anyPass2([includes2('"'), includes2("'"), includes2("`")]), K("string")],
  [matchesCaseFormat(constantCase), K("constant")],
  [both(includes2("-"), matchesCaseFormat(paramCase)), K("param")],
  [matchesCaseFormat(pascalCase), K("proper")],
  [both(includes2("/"), matchesCaseFormat(pathCase)), K("path")],
  [both((z) => toLower(z) !== z, matchesCaseFormat(camelCase)), K("content")],
  [K(true), K("text")]
]);
var cleanups = anyPass2([
  equals(""),
  equals("*"),
  startsWith("/"),
  startsWith("```")
]);
var getWordsFromEntities = curry2(
  (infer, skippables, raw) => pipe2(
    map2(map2(noCase)),
    values,
    reduce((agg, x) => [...agg, ...x], []),
    chain(split(" ")),
    map2(toLower),
    reject2(includes2($, skippables)),
    infer ? map2(stemmer) : I,
    (z) => z.sort()
  )(raw)
);
var parseWords = ({
  limit,
  skipWords: skip = [],
  entities,
  histogramMinimum: minimum,
  assumeSimilarWords: infer = true
}) => pipe2(
  getWordsFromEntities(infer, skip),
  reduce((agg, x) => {
    const y = infer ? stemmer(x) : x;
    const current = agg[y] || 0;
    agg[y] = current + 1;
    return agg;
  }, {}),
  minimum > 0 ? filter((z) => z > minimum) : I,
  toPairs,
  sortWith([descend(last)]),
  slice(0, limit),
  fromPairs
)(entities);
var compareContentToWords = curry2((infer, line, content, _words) => {
  if (isEmpty(content) || isEmpty(_words))
    return false;
  const cleancontent = pipe2(
    map2(noCase),
    chain(split(" ")),
    infer ? map2(stemmer) : I,
    uniq
  )(content);
  return reduce(
    (agg, word) => {
      if (agg.matched) {
        return agg;
      }
      const stem = infer ? stemmer(word) : word;
      const matched = includes2(stem, cleancontent);
      return matched ? { matched, relationships: [...agg.relationships, [line, word]] } : agg;
    },
    { matched: false, relationships: [] },
    keys(_words)
  );
});
var correlate = curry2(
  (infer, _words, _lines) => pipe2(
    reduce((agg, { line, content }) => {
      const compared = compareContentToWords(infer, line, content, _words);
      return compared.matched ? [...agg, compared.relationships] : agg;
    }, []),
    map2(head),
    groupBy(last),
    map2(map2(head))
  )(_lines)
);
var dropMultilineCommentsWithSteps = reduce(
  (agg, [k, v]) => {
    const commenting = agg.commentMode;
    const commentEnds = either(endsWith("*/"), includes2("*/"))(v);
    const commentStarts = either(startsWith("/*"), includes2("/*"))(v);
    return commenting && !commentEnds ? agg : !commenting && commentStarts ? { commentMode: true, stack: agg.stack } : { commentMode: false, stack: [...agg.stack, [k, v]] };
  },
  { stack: [], commentMode: false }
);
var dropMultilineComments = pipe2(
  dropMultilineCommentsWithSteps,
  prop("stack"),
  // clean up some stuff we missed
  rejectSnd(equals("*/"))
);
var dropImports = when(
  anySnd(evidenceOfImports),
  pipe2(
    reduce(
      (agg, line) => evidenceOfImports(line[1]) ? agg : [...agg, line],
      []
    )
  )
);
var dropStrings = mapSnd(
  pipe2(replace2(/".*"/g, ""), replace2(/'.*'/g, ""), replace2(/`.*`/g, ""))
);
var cleanEntities = ({ entities, ...x }) => ({
  ...x,
  entities: pipe2(
    groupBy(head),
    map2(map2(last)),
    map2(uniq),
    map2((z) => z.sort())
  )(entities)
});

// src/stats.js
var histograph = curry3((config, { entities, ...x }) => ({
  ...x,
  entities,
  words: parseWords({ ...config, entities })
}));
var correlateSimilar = curry3(
  ($similarWords, { words, lines, ...x }) => {
    const report = correlate($similarWords, words, lines);
    return { ...x, lines, words, report };
  }
);

// src/reporter.js
import H from "chalk";
import {
  mergeRight,
  addIndex,
  curry as curry4,
  join,
  map as map3,
  pipe as pipe3,
  reduce as reduce2,
  replace as replace3,
  toPairs as toPairs2,
  zip,
  length
} from "ramda";

// src/config.js
var BW_LOGO = `     /\\/\\
    /^^^^\\
  <d______b>
   |(\u2609  \u2609)|
   (\u220F\u220F\u220F\u220F\u220F\u220F)
  \u239B\u239D      \u23A0\u239E`;

// src/reporter.js
var getWords = pipe3(
  toPairs2,
  // sortBy(pipe(last, length, z => z * -1)),
  map3(([word, _lines]) => {
    const count = length(_lines);
    return ` - ${H.red(word)} (${count} reference${count === 0 || count > 1 ? "s" : ""})`;
  }),
  join("\n")
);
var summarize = pipe3(
  toPairs2,
  // sortBy(pipe(last, length, z => z * -1)),
  addIndex(map3)(
    ([word, _lines], i) => `${i + 1}. ${H.red(word)}
   on ${H.blue("lines")}: ${_lines.join(", ")}`
  ),
  join("\n")
);
var robotTouristReporter = curry4(
  ($wordlimit, $fun, { file: f, report }) => `${$fun ? `
${BW_LOGO}

` : ""}SCANNED: ${f}
The ${$wordlimit !== Infinity ? $wordlimit + " " : ""}most common words in this file are:
${getWords(report)}
These words were found in this pattern:
${summarize(report)}
`
);
var dropJSKeywords = mapSnd(replace3(RG_JS_KEYWORDS, ""));
var dropTSKeywords = mapSnd(replace3(RG_TS_KEYWORDS, ""));
var dropUserDefinedValues = curry4(
  (skippable, x) => mapSnd(replace3(skippable, ""))(x)
);
var createEntitiesFromRaw = pipe3(
  reduce2(
    (agg, { line, content, classification }) => ({
      ...agg,
      lines: [...agg.lines, { line, content, classification }],
      entities: pipe3(zip(classification), (merged) => [
        ...agg.entities,
        ...merged
      ])(content)
    }),
    { lines: [], entities: [] }
  )
);
var createEntities = curry4(
  (file, raw) => pipe3(createEntitiesFromRaw, mergeRight({ file }))(raw)
);

// src/core.js
var parser = curry5((opts, args) => yargsParser(args, opts));
var classifyEntities = pipe4(
  // convert to object
  map4(([line, content]) => ({
    line,
    content,
    classification: map4(classify)(content)
  })),
  // do some secondary logic now that we have classification
  createEntitiesFromRaw,
  // clean up entities to be more useful
  cleanEntities
);
var parse = curry5(
  ({
    ignore: $ignore,
    dropImports: $dropImports,
    dropStrings: $dropStrings,
    dropJSKeywords: $dropJS,
    dropTSKeywords: $dropTS
  }, input) => pipe4(
    // throw away single line comments
    rejectSnd(startsWith2("//")),
    // throw away multi line comments
    dropMultilineComments,
    rejectSnd(equals2("*/")),
    // we don't care about the imports, that's all stuff upstream from this file
    $dropImports ? dropImports : I2,
    // throw away strings, we don't care about them* - now configurable
    $dropStrings ? dropStrings : I2,
    // apply some radical cleanups to text
    mapSnd(pipe4(replaceNoise, trim)),
    // if it's JS we don't care
    $dropJS ? dropJSKeywords : I2,
    // if it's TS we don't care
    $dropTS ? dropTSKeywords : I2,
    // if it's stuff we said we don't care about, we don't care!
    dropUserDefinedValues($ignore),
    // do another round of cleanup, convert to array of words
    mapSnd(pipe4(trim, replace4(/\s\s+/g, " "), split2(" "), reject3(cleanups))),
    // no content, u bi rata
    reject3(([, v]) => v.length === 0)
  )(input)
);
var parseAndClassify = curry5(
  (conf, x) => pipe4(parse(conf), classifyEntities)(x)
);
var parseAndClassifyWithFile = curry5(
  (file, conf, x) => pipe4(parseAndClassify(conf), mergeRight2({ file }))(x)
);
var simplifier = curry5(
  (conf, x) => parseAndClassifyWithFile(conf.file, conf, x)
);
var robotTourist = curry5(
  (config, x) => pipe4(
    simplifier(config),
    histograph(config),
    correlateSimilar(config.assumeSimilarWords)
  )(x)
);

// src/plugin-robot-tourist.js
var NAME = "robot-tourist";
var plugin = {
  name: NAME,
  dependencies: [],
  fn: (state, file, { config }) => {
    const { file: _f, ...x } = robotTourist({
      dropStrings: true,
      dropJSKeywords: true,
      dropTSKeywords: true,
      dropImports: true,
      assumeSimilarWords: true,
      ...config,
      file: file.name
    })(file.body);
    return x;
  }
};
var plugin_robot_tourist_default = plugin;
export {
  plugin_robot_tourist_default as default
};
