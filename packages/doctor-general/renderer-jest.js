import { wrap, isNotEmpty } from 'inherent'
import {
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
  propOr,
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
  summary: propOr('?', 'summary'),
  example: pathOr('', ['structure', 'example']),
})

const getCurried = pathOr([], ['structure', 'curried'])

const MAGIC_IMPORT_KEY = 'drgen-import-above'

const renderTest = ({ title, example, asyncCallback }) => {
  const exlines = example.split('\n').filter(l => !l.startsWith('```'))
  const hasImports = any(includes(MAGIC_IMPORT_KEY), exlines)
  const importIndex = findIndex(includes(MAGIC_IMPORT_KEY), exlines)
  const [imps, content] = hasImports
    ? [exlines.slice(0, importIndex), exlines.slice(importIndex + 1)]
    : ['', exlines]
  return `
${imps.join('\n')}
test('${title}', (${asyncCallback ? 'done' : ''}) => {
  ${content.join('\n  ')}
})
`
}

const handleCurriedExample = pipe(
  wrap,
  ap([getCurried, grabCommentData]),
  ([curried, { summary }]) =>
    map(({ name, lines: example }) =>
      renderTest({
        name,
        summary,
        example,
      })
    )(curried),
  join('\n')
)

export const commentToJestTest = handleSpecialCases(
  ifElse(
    pipe(getCurried, isNotEmpty),
    handleCurriedExample,
    pipe(grabCommentData, renderTest)
  )
)
