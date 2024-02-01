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
  is,
  curry,
  when,
} from 'ramda'
import { log } from './log'
import { matchesTestable } from './comment-test'

const fromStructureOr = curry((def, crumbs, x) =>
  pathOr(def, ['structure', ...when(is(String), wrap)(crumbs)], x)
)

const handleSpecialCases = ifElse(
  either(fromStructureOr(false, 'page'), fromStructureOr(false, 'pageSummary')),
  K('')
)

const grabCommentData = applySpec({
  title: fromStructureOr('Unknown', 'name'),
  example: fromStructureOr('', 'example'),
  future: fromStructureOr('', 'future'),
})

const getCurried = fromStructureOr([], 'curried')
const MAGIC_IMPORT_KEY = 'drgen-import-above'
const hasMagicImport = includes(MAGIC_IMPORT_KEY)
const renderTest = ({ title, example, future: asyncCallback }) => {
  if (!matchesTestable(example)) return ''
  const exlines = example.filter(l => !l.startsWith('```'))
  const hasImports = any(hasMagicImport, exlines)
  const importIndex = findIndex(hasMagicImport, exlines)
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
  function processCurried([curried, { future, summary }]) {
    return map(function processEachMorphism({ name: title, lines: example }) {
      return pipe(
        log.curried('currious'),
        renderTest
      )({
        title,
        summary,
        example,
        future,
      })
    })(curried)
  },
  log.renderer('out?'),
  filter(isNotEmpty),
  join('\n')
)

export const commentToJestTest = pipe(
  log.renderer('comment to jest'),
  handleSpecialCases(
    ifElse(
      pipe(getCurried, isNotEmpty),
      handleCurriedExample,
      pipe(grabCommentData, renderTest)
    )
  )
)
