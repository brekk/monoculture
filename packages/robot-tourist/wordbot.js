#!/usr/bin/env node

// src/cli.js
import { configurate } from 'configurate'
import {
  chain as chain2,
  mergeRight as mergeRight3,
  addIndex as addIndex2,
  curry as curry6,
  map as map5,
  pipe as pipe6,
  split as split3,
  trim as trim2,
,
  mergeRight,
  addIndex,
  curry as curry2,
  join,
  map as map2,
  pipe as pipe2,
  reduce,
  replace,
  toPairs,
  zip,
  length
} from "ramda";
import yargsParser2 from "yargs-parser";
import { readFile } from "file-system";
import { fork, resolve } from "fluture";

// src/config.js
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
var CERTAIN_COMMON_WORDS = ["use", "get", "id"];
var USER_DEFINED_VALUES = [];
var DEFAULT_CONFIG = {
  help: false,
  fun: true,
  limit: Infinity,
  skipWords: [],
  ignore: USER_DEFINED_VALUES,
  ignoreTokens: CERTAIN_COMMON_WORDS,
  dropStrings: true,
  histogramMinimum: 1,
  assumeSimilarWords: true,
  dropJSKeywords: true,
  dropTSKeywords: true
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

// src/reporter.js
import H2 from "chalk";
import { trace } from "xtrace";

// src/regex.js
let makeRegexFromArray = x => new RegExp(`\\b${x.join("\\b|\\b")}\\b`, "g");

// src/constants.js
let TS_KEYWORDS = ['any', 'boolean', 'string', 'number', 'interface', 'type']
let JS_KEYWORDS = [
  'Error',
  'switch',
  'case',
  'class',
  'as',
  'async',
  'await',
  'catch',
  'children',
  'const',
  'default',
  'else',
  'export',
  'for',
  'forEach',
  'from',
  'function',
  'if',
  'import',
  'length',
  'let',
  'map',
  'null',
  'push',
  'reduce',
  'return',
  'then',
  'this',
  'try',
  'undefined',
  'var',
  'while',
  'extends',
  'new',
]
let RG_JS_KEYWORDS = makeRegexFromArray(JS_KEYWORDS)
let RG_TS_KEYWORDS = makeRegexFromArray(TS_KEYWORDS)
let SOURCE_CODE_NOISE = /[\$\!\|;:\.%\[\]<>,\=\)\(\}\{&\?\d]/g

// src/tuple.js
import { curry, pipe, map, reject, any } from 'ramda'
let snd = ([, v]) => v
let tupleValueTransform = curry((fn, [k, v]) => [k, fn(v)])
let tupleTransform = curry((hoc, fn, list) =>
  hoc(tupleValueTransform(fn), list)
)
let applySecond = curry((hoc, fn, list) =>
  hoc(pipe(tupleValueTransform(fn), snd), list)
)
let mapSnd = tupleTransform(map)
let rejectSnd = applySecond(reject)
let anySnd = applySecond(any)

// src/reporter.js
let getWords = pipe2(
  toPairs,
  // sortBy(pipe(last, length, z => z * -1)),
  map2(([word, _lines]) => {
    const count = length(_lines)
    return ` - ${H2.red(word)} (${count} reference${
      count === 0 || count > 1 ? 's' : ''
    })`
  }),
  join('\n')
)
let summarize = pipe2(
  toPairs,
  // sortBy(pipe(last, length, z => z * -1)),
  addIndex(map2)(
    ([word, _lines], i) => `${i + 1}. ${H2.red(word)}
   on ${H2.blue('lines')}: ${_lines.join(', ')}`
  ),
  join('\n')
)
let robotTouristReporter = curry2(
  ($wordlimit, $fun, { file: f, report }) => `${
    $fun
      ? `
${LOGO}

`
      : ''
  }SCANNED: ${f}
The ${
    $wordlimit !== Infinity ? $wordlimit + ' ' : ''
  }most common words in this file are:
${getWords(report)}
These words were found in this pattern:
${summarize(report)}
`
)
let dropJSKeywords = mapSnd(replace(RG_JS_KEYWORDS, ''))
let dropTSKeywords = mapSnd(replace(RG_TS_KEYWORDS, ''))
let dropUserDefinedValues = curry2((skippable, x) =>
  mapSnd(replace(skippable, ''))(x)
)
let createEntitiesFromRaw = pipe2(
  reduce(
    (agg, { line, content, classification }) => ({
      ...agg,
      lines: [...agg.lines, { line, content, classification }],
      entities: pipe2(zip(classification), merged => [
        ...agg.entities,
        ...merged,
      ])(content),
    }),
    { lines: [], entities: [] }
  )
)
let createEntities = curry2((file, raw) =>
  pipe2(createEntitiesFromRaw, mergeRight({ file }))(raw)
)

// src/stats.js
import { curry as curry4, pipe as pipe4 } from 'ramda'
import { callBinaryWithScope } from 'xtrace'

// src/string.js
import {
  prop,
  __ as $,
  always as K,
  anyPass as anyPass2,
  both,
  chain,
  cond,
  curry as curry3,
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
  map as map3,
  pipe as pipe3,
  reduce as reduce2,
  reject as reject2,
  replace as replace3,
  slice,
  sortWith,
  split,
  startsWith,
  toLower,
  toPairs as toPairs2,
  uniq,
  values,
  when,
} from 'ramda'
import {
  camelCase,
  constantCase,
  pascalCase,
  pathCase,
  kebabCase as paramCase,
  noCase,
} from 'change-case'
import { stemmer } from 'stemmer'

// src/source-matcher.js
import { anyPass, includes, replace as replace2 } from 'ramda'
let evidenceOfImports = anyPass([
  includes('from'),
  includes('require'),
  includes('import'),
])
let replaceNoise = replace2(SOURCE_CODE_NOISE, ' ')

// src/string.js
var matchesCaseFormat = curry3((formatter, x) => formatter(x) === x)
let classify = cond([
  [anyPass2([includes2('"'), includes2("'"), includes2('`')]), K('string')],
  [matchesCaseFormat(constantCase), K('constant')],
  [both(includes2('-'), matchesCaseFormat(paramCase)), K('param')],
  [matchesCaseFormat(pascalCase), K('proper')],
  [both(includes2('/'), matchesCaseFormat(pathCase)), K('path')],
  [both(z => toLower(z) !== z, matchesCaseFormat(camelCase)), K("content")],
  [K(true), K('text')],
])
let cleanups = anyPass2([
  equals(''),
  equals('*'),
  startsWith('/'),
  startsWith('```'),
])
let getWordsFromEntities = curry3((infer, skippables, raw) =>
  pipe3(
    map3(map3(noCase)),
    values,
    reduce2((agg, x) => [...agg, ...x], []),
    chain(split(' ')),
    map3(toLower),
    reject2(includes2($, skippables)),
    infer ? map3(stemmer) : I,
    z => z.sort()
  )(raw)
)
let parseWords = ({ limit, skip, entities, minimum, infer = true }) =>
  pipe3(
    getWordsFromEntities(infer, skip),
    reduce2((agg, x) => {
      const y = infer ? stemmer(x) : x
      const current = agg[y] || 0
      agg[y] = current + 1
      return agg
    }, {}),
    minimum > 0 ? filter(z => z > minimum) : I,
    toPairs2,
    sortWith([descend(last)]),
    slice(0, limit),
    fromPairs
  )(entities)
let compareContentToWords = curry3((infer, line, content, _words) => {
  if (isEmpty(content) || isEmpty(_words)) return false
  const cleancontent = pipe3(
    map3(noCase),
    chain(split(' ')),
    infer ? map3(stemmer) : I,
    uniq
  )(content)
  return reduce2(
    (agg, word) => {
      if (agg.matched) {
        return agg
      }
      const stem = infer ? stemmer(word) : word
      const matched = includes2(stem, cleancontent)
      return matched
        ? { matched, relationships: [...agg.relationships, [line, word]] }
        : agg
    },
    { matched: false, relationships: [] },
    keys(_words)
  )
})
let correlate = curry3((infer, _words, _lines) =>
  pipe3(
    reduce2((agg, { line, content }) => {
      const compared = compareContentToWords(infer, line, content, _words)
      return compared.matched ? [...agg, compared.relationships] : agg
    }, []),
    map3(head),
    groupBy(last),
    map3(map3(head))
  )(_lines)
)
let dropMultilineCommentsWithSteps = reduce2(
  (agg, [k, v]) => {
    const commenting = agg.commentMode
    const commentEnds = either(endsWith('*/'), includes2('*/'))(v)
    const commentStarts = either(startsWith('/*'), includes2('/*'))(v)
    return commenting && !commentEnds
      ? agg
      : !commenting && commentStarts
      ? { commentMode: true, stack: agg.stack }
      : { commentMode: false, stack: [...agg.stack, [k, v]] }
  },
  { stack: [], commentMode: false }
)
let dropMultilineComments = pipe3(
  dropMultilineCommentsWithSteps,
  prop('stack'),
  // clean up some stuff we missed
  rejectSnd(equals('*/'))
)
let dropImports = when(
  anySnd(evidenceOfImports),
  pipe3(
    reduce2(
      (agg, line) => (evidenceOfImports(line[1]) ? agg : [...agg, line]),
      []
    )
  )
)
let dropStrings = mapSnd(
  pipe3(replace3(/".*"/g, ''), replace3(/'.*'/g, ''), replace3(/`.*`/g, ''))
)
let cleanEntities = ({ entities, ...x }) => ({
  ...x,
  entities: pipe3(
    groupBy(head),
    map3(map3(last)),
    map3(uniq),
    map3(z => z.sort())
  )(entities),
})

// src/stats.js
let j2 = x => JSON.stringify(x, null, 2);
let histograph = curry4(
  (
    {
      wordlimit: $wordlimit,
      skip: $skipWords,
      minimum: $hMin,
      infer: $similarWords,
    },
    { entities, ...x }
  ) => ({
    ...x,
    entities,
    words: parseWords({
      limit: $wordlimit,
      skip: $skipWords,
      entities,
      minimum: $hMin,
      infer: $similarWords,
    }),
  })
)
let jtrace = callBinaryWithScope(console.log, j2)
let _correlateSimilar = curry4(
  ($similarWords, { words: w, lines: l, ...x }) => {
    const report = correlate($similarWords, w, l)
    return { ...x, lines: l, words: w, report }
  }
)
let correlateSimilar = curry4((a, b) =>
  pipe4(jtrace('in'), _correlateSimilar(a), jtrace('b'))(b)
)

// src/robot-tourist.js
import {
  mergeRight as mergeRight2,
  curry as curry5,
  identity as I2,
  map as map4,
  pipe as pipe5,
  reject as reject3,
  replace as replace4,
  split as split2,
  startsWith as startsWith2,
  trim,
} from 'ramda'
import yargsParser from 'yargs-parser'
let parser = curry5((opts, args) => yargsParser(args, opts))
let classifyEntities = pipe5(
  // convert to object
  map4(([line, content]) => ({
    line,
    content,
    classification: map4(classify)(content),
  })),
  // do some secondary logic now that we have classification
  createEntitiesFromRaw,
  // clean up entities to be more useful
  cleanEntities
)
let parse = curry5(
  (
    {
      ignore: $ignore,
      dropImports: $dropImports,
      dropStrings: $dropStrings,
      dropJS: $dropJS,
      dropTS: $dropTS,
    },
    input
  ) =>
    pipe5(
      // throw away single line comments
      rejectSnd(startsWith2('//')),
      // throw away multi line comments
      dropMultilineComments,
      // we don't care about the imports, that's all stuff upstream from this file
      $dropImports ? dropImports : I2,
      // throw away strings, we don't care about them* - now configurable
      $dropStrings ? dropStrings : I2,
      // apply some radical cleanups to text
      mapSnd(pipe5(replaceNoise, trim)),
      // if it's JS we don't care
      $dropJS ? dropJSKeywords : I2,
      // if it's TS we don't care
      $dropTS ? dropTSKeywords : I2,
      // if it's stuff we said we don't care about, we don't care!
      dropUserDefinedValues($ignore),
      // do another round of cleanup, convert to array of words
      mapSnd(
        pipe5(trim, replace4(/\s\s+/g, ' '), split2(' '), reject3(cleanups))
      ),
      // no content, u bi rata
      reject3(([, v]) => v.length === 0)
    )(input)
)
let parseAndClassify = curry5((conf, x) =>
  pipe5(parse(conf), classifyEntities)(x)
)
let parseAndClassifyWithFile = curry5((file, conf, x) =>
  pipe5(parseAndClassify(conf), mergeRight2({ file }))(x)
)
let robotTourist = curry5(
  (
    {
      file: $file,
      ignore: $ignore,
      skipWords: $skipWords,
      dropStrings: $dropStrings,
      histogramMinimum: $hMin,
      assumeSimilarWords: $similarWords,
      dropJSKeywords: $dropJS,
      dropTSKeywords: $dropTS,
      dropImports: $dropImports,
      limit: $wordlimit,
    },
    x
  ) =>
    pipe5(
      parseAndClassifyWithFile($file, {
        ignore: $ignore,
        dropImports: $dropImports,
        dropStrings: $dropStrings,
        dropJS: $dropJS,
        dropTS: $dropTS,
      }),
      histograph({
        wordlimit: $wordlimit,
        skip: $skipWords,
        minimum: $hMin,
        infer: $similarWords,
      }),
      correlateSimilar($similarWords)
    )(x)
)

// src/cli.js
let parser2 = curry6((opts, args) => yargsParser2(args, opts))
let cli = ({ fun: $fun, _: [$file], limit: $wordlimit, ...$config }) =>
  pipe6(
    readFile,
    map5(
      pipe6(
        split3('\n'),
        // add line numbers
        addIndex2(map5)((x, i) => [i + 1, trim2(x)]),
        robotTourist({ ...$config, file: $file }),
        robotTouristReporter($wordlimit, $fun)
      )
    )
  )($file)
pipe6(
  configurate(CONFIG, DEFAULT_CONFIG, HELP_CONFIG, 'robot-tourist'),
  chain2(cli),
  // eslint-disable-next-line no-console
  fork(console.error)(console.log)
)(process.argv.slice(2))
export { parser2 as parser }
