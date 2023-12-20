// src/stats.js
import { curry as curry3 } from "ramda";

// src/string.js
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

// src/plugin-robot-tourist.js
var plugin = {
  name: "robot-tourist",
  dependencies: ["robot-tourist-simplifier"],
  selector: (y) => y?.state?.["robot-tourist-simplifier"],
  fn: (state, file, { config }) => {
    const { [file.name]: lookup } = state;
    return correlateSimilar(config?.assumeSimilarWords ?? true, lookup);
  }
};
var plugin_robot_tourist_default = plugin;
export {
  plugin_robot_tourist_default as default
};
