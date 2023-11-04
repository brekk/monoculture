import {
  prop,
  __ as $,
  always as K,
  anyPass,
  both,
  chain,
  cond,
  curry,
  descend,
  either,
  endsWith,
  equals,
  filter,
  fromPairs,
  groupBy,
  head,
  identity as I,
  includes,
  isEmpty,
  keys,
  last,
  map,
  pipe,
  reduce,
  reject,
  replace,
  slice,
  sortWith,
  split,
  startsWith,
  toLower,
  toPairs,
  uniq,
  values,
  when,
} from 'ramda'
import {
  camelCase,
  constantCase,
  pascalCase,
  pathCase,
  paramCase,
  noCase,
} from 'change-case'
import { stemmer } from 'stemmer'
import { rejectSnd, mapSnd, anySnd } from './tuple'
import { evidenceOfImports } from './source-matcher'
import { trace } from './trace'

export const matchesCaseFormat = curry((formatter, x) => formatter(x) === x)

export const classify = cond([
  [anyPass([includes('"'), includes("'"), includes('`')]), K('string')],
  [matchesCaseFormat(constantCase), K('constant')],
  [both(includes('-'), matchesCaseFormat(paramCase)), K('param')],
  [matchesCaseFormat(pascalCase), K('proper')],
  [both(includes('/'), matchesCaseFormat(pathCase)), K('path')],
  [both(z => toLower(z) !== z, matchesCaseFormat(camelCase)), K('content')],
  [K(true), K('text')],
])
export const cleanups = anyPass([
  equals(''),
  equals('*'),
  startsWith('/'),
  startsWith('```'),
])

export const getWordsFromEntities = curry((infer, skippables, raw) =>
  pipe(
    map(map(noCase)),
    values,
    reduce((agg, x) => [...agg, ...x], []),
    chain(split(' ')),
    map(toLower),
    reject(includes($, skippables)),
    infer ? map(stemmer) : I,
    z => z.sort()
  )(raw)
)

export const parseWords = ({ limit, skip, entities, minimum, infer = true }) =>
  pipe(
    getWordsFromEntities(infer, skip),
    reduce((agg, x) => {
      const y = infer ? stemmer(x) : x
      const current = agg[y] || 0
      agg[y] = current + 1
      return agg
    }, {}),
    minimum > 0 ? filter(z => z > minimum) : I,
    toPairs,
    sortWith([descend(last)]),
    slice(0, limit),
    fromPairs
  )(entities)

export const compareContentToWords = curry((infer, line, content, _words) => {
  if (isEmpty(content) || isEmpty(_words)) return false
  const cleancontent = pipe(
    map(noCase),
    chain(split(' ')),
    infer ? map(stemmer) : I,
    uniq
  )(content)
  return reduce(
    (agg, word) => {
      if (agg.matched) {
        return agg
      }
      const stem = infer ? stemmer(word) : word
      const matched = includes(stem, cleancontent)
      return matched
        ? { matched, relationships: [...agg.relationships, [line, word]] }
        : agg
    },
    { matched: false, relationships: [] },
    keys(_words)
  )
})

export const correlate = curry((infer, _words, _lines) =>
  pipe(
    reduce((agg, { line, content }) => {
      const compared = compareContentToWords(infer, line, content, _words)
      return compared.matched ? [...agg, compared.relationships] : agg
    }, []),
    map(head),
    groupBy(last),
    map(map(head))
  )(_lines)
)

export const dropMultilineCommentsWithSteps = reduce(
  (agg, [k, v]) => {
    const commenting = agg.commentMode
    const commentEnds = either(endsWith('*/'), includes('*/'))(v)
    const commentStarts = either(startsWith('/*'), includes('/*'))(v)
    return commenting && !commentEnds
      ? agg
      : !commenting && commentStarts
      ? { commentMode: true, stack: agg.stack }
      : { commentMode: false, stack: [...agg.stack, [k, v]] }
  },
  { stack: [], commentMode: false }
)
export const dropMultilineComments = pipe(
  dropMultilineCommentsWithSteps,
  prop('stack'),
  // clean up some stuff we missed
  rejectSnd(equals('*/'))
)

export const dropImports = when(
  anySnd(evidenceOfImports),
  pipe(
    reduce(
      (agg, line) => (evidenceOfImports(line[1]) ? agg : [...agg, line]),
      []
    )
  )
)

export const dropStrings = mapSnd(
  pipe(replace(/".*"/g, ''), replace(/'.*'/g, ''), replace(/`.*`/g, ''))
)

export const cleanEntities = ({ entities, ...x }) => ({
  ...x,
  entities: pipe(
    groupBy(head),
    map(map(last)),
    map(uniq),
    map(z => z.sort())
  )(entities),
})
