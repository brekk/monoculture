import { wrap, isNotEmpty } from 'inherent'
import {
  filter,
  any,
  includes,
  findIndex,
  ap,
  join,
  either,
  ifElse,
  pipe,
  applySpec,
  pathOr,
  always as K,
  map,
} from 'ramda'

const handleSpecialCases = ifElse(
  either(
    pathOr(false, ['structure', 'page']),
    pathOr(false, ['structure', 'pageSummary'])
  ),
  K('')
)

const grabCommentData = applySpec({
  title: pathOr('Unknown', ['structure', 'name']),
  example: pathOr('', ['structure', 'example']),
  future: pathOr('', ['structure', 'future']),
})

const getCurried = pathOr([], ['structure', 'curried'])
const MAGIC_IMPORT_KEY = 'drgen-import-above'
const renderTest = ({ title, example, future: asyncCallback }) => {
  if (!includes('test=true', example)) return ''
  const exlines = example.split('\n').filter(l => !l.startsWith('```'))
  const hasImports = any(includes(MAGIC_IMPORT_KEY), exlines)
  const importIndex = findIndex(includes(MAGIC_IMPORT_KEY), exlines)
  const [imps, content] = hasImports
    ? [exlines.slice(0, importIndex), exlines.slice(importIndex + 1)]
    : [[], exlines]
  return `${imps.length ? imps.join('\n') + '\n' : ''}test('${title}', (${
    asyncCallback ? 'done' : ''
  }) => {
  ${content.join('\n  ')}
})
`
}

const handleCurriedExample = pipe(
  wrap,
  ap([getCurried, grabCommentData]),
  ([curried, { future, summary }]) =>
    map(({ name, lines: example }) =>
      renderTest({
        name,
        summary,
        example,
        future,
      })
    )(curried),
  filter(isNotEmpty),
  join('\n')
)

export const commentToJestTest = handleSpecialCases(
  ifElse(
    pipe(getCurried, isNotEmpty),
    handleCurriedExample,
    pipe(grabCommentData, renderTest)
  )
)
