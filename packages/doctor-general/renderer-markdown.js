import { wrap } from 'inherent'
import {
  curry,
  replace,
  concat,
  ap,
  lt,
  filter,
  join,
  identity as I,
  either,
  ifElse,
  pipe,
  applySpec,
  pathOr,
  propOr,
  when,
  startsWith,
  length,
  always as K,
  map,
  slice,
} from 'ramda'
import { lines, unlines } from 'knot'
import { MAGIC_IMPORT_KEY } from './constants'
import { log } from './log'

const stripFence = when(startsWith('```'), K(''))

const liveExample = ex =>
  pipe(lines, map(stripFence), slice(1, length(ex)), unlines)(ex)

const handleSpecialCases = ifElse(
  // this is a special case where we want to be able to dynamically rename the page
  either(
    pathOr(false, ['structure', 'page']),
    pathOr(false, ['structure', 'pageSummary'])
  ),
  // but since we're cheating we don't want to list it as a comment
  K('')
)

const flattenCommentData = applySpec({
  title: pathOr('Unknown', ['structure', 'name']),
  summary: propOr('?', 'summary'),
  links: propOr([], 'links'),
  example: pipe(
    pathOr('', ['structure', 'example']),
    replace(new RegExp('// ' + MAGIC_IMPORT_KEY, 'g'), '')
  ),
})

const getCurried = pathOr([], ['structure', 'curried'])

const cleanlines = pipe(filter(I), join('\n'))

const insertIntoExample = curry((imports, slugName, example) => {
  let inserted = false
  const fixed = !imports.length
    ? example
    : pipe(
        lines,
        map(y => {
          if (!inserted && y.startsWith('```')) {
            y += `\nimport { ${imports.join(', ')} } from '${slugName}'\n`
            inserted = true
          }
          return y
        }),
        unlines
      )(example)
  log.renderer('fixed', fixed)
  return fixed
})

const commonFields = curry(
  (imports, { slugName, name, summary, links, example: ex }) => {
    // const ex = insertIntoExample(uniq([...imports, name]), slugName, example)
    return [
      name ? '## ' + name + '\n' : '',
      summary ? summary + '\n' : '',
      ex ? `### Usage\n${ex}` : '',
      ex.includes('live=true') ? `\n\n${liveExample(ex)}` : '',
      links.length ? `\n### See also\n - ${links.join('\n - ')}` : '',
    ]
  }
)

const handleCurriedExample = curry((imports, x) =>
  pipe(
    wrap,
    ap([getCurried, flattenCommentData]),
    ([curried, { summary, links, slugName }]) =>
      map(({ name, lines: example }) =>
        cleanlines(
          commonFields(imports, {
            slugName,
            name,
            summary,
            example,
            links: pipe(
              map(({ name: n }) => n),
              filter(y => y !== name),
              concat(links)
            )(curried),
          })
        )
      )(curried),
    join('\n')
  )(x)
)

export const commentToMarkdown = curry((slugName, imports, x) =>
  handleSpecialCases(
    pipe(
      ifElse(
        pipe(getCurried, length, lt(0)),
        handleCurriedExample(imports),
        pipe(flattenCommentData, ({ title, summary, links, example }) =>
          cleanlines(
            commonFields(imports, {
              slugName,
              name: title,
              summary,
              example,
              links,
            })
          )
        )
      )
    )
  )(x)
)
