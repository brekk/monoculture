import H from 'chalk'
import {
  mergeRight,
  addIndex,
  curry,
  join,
  map,
  pipe,
  reduce,
  replace,
  toPairs,
  zip,
  length,
} from 'ramda'
import { RG_JS_KEYWORDS, RG_TS_KEYWORDS } from './constants'
import { mapSnd } from './tuple'
import { LOGO } from './config'

export const getWords = pipe(
  toPairs,
  // sortBy(pipe(last, length, z => z * -1)),
  map(([word, _lines]) => {
    const count = length(_lines)
    return ` - ${H.red(word)} (${count} reference${
      count === 0 || count > 1 ? 's' : ''
    })`
  }),
  join('\n')
)

export const summarize = pipe(
  toPairs,
  // sortBy(pipe(last, length, z => z * -1)),
  addIndex(map)(
    ([word, _lines], i) =>
      `${i + 1}. ${H.red(word)}\n   on ${H.blue('lines')}: ${_lines.join(', ')}`
  ),
  join('\n')
)

export const robotTouristReporter = curry(
  ($wordlimit, $fun, { file: f, report }) =>
    `${$fun ? `\n${LOGO}\n\n` : ''}SCANNED: ${f}
The ${
      $wordlimit !== Infinity ? $wordlimit + ' ' : ''
    }most common words in this file are:
${getWords(report)}
These words were found in this pattern:
${summarize(report)}
`
)
export const dropJSKeywords = mapSnd(replace(RG_JS_KEYWORDS, ''))
export const dropTSKeywords = mapSnd(replace(RG_TS_KEYWORDS, ''))

export const dropUserDefinedValues = curry((skippable, x) =>
  mapSnd(replace(skippable, ''))(x)
)

export const createEntitiesFromRaw = pipe(
  reduce(
    (agg, { line, content, classification }) => ({
      ...agg,
      lines: [...agg.lines, { line, content, classification }],
      entities: pipe(zip(classification), merged => [
        ...agg.entities,
        ...merged,
      ])(content),
    }),
    { lines: [], entities: [] }
  )
)

export const createEntities = curry((file, raw) =>
  pipe(createEntitiesFromRaw, mergeRight({ file }))(raw)
)
