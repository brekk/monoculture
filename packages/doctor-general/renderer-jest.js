import { wrap, isNotEmpty } from 'inherent'
import {
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

const renderTest = ({ title, example, asyncCallback }) => `
test('${title}', (${asyncCallback ? 'done' : ''}) => {
  ${example.split('\n').join('\n  ')}
})
`

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
