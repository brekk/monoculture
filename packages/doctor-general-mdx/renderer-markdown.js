import { wrap } from 'inherent'
import {
  uniq,
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

// TODO: we should consolidate this
const MAGIC_IMPORT_KEY = 'drgen-import-above'

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
  package: propOr('?', 'package'),
  filename: propOr('?', 'filename'),
  title: pathOr('Unknown', ['structure', 'name']),
  summary: propOr('?', 'summary'),
  links: propOr([], 'links'),
  example: pipe(
    pathOr('', ['structure', 'example']),
    replace(new RegExp('// ' + MAGIC_IMPORT_KEY, 'g'), '')
  ),
  exported: pathOr(false, ['structure', 'exported']),
})

const getCurried = pathOr([], ['structure', 'curried'])

const cleanlines = pipe(filter(I), join('\n'))

const insertIntoExample = curry(
  function _insertIntoExample(imports, importFrom, example) {
    let inserted = false
    const fixed = !imports.length
      ? example
      : pipe(
          lines,
          map(y => {
            if (!inserted && y.startsWith('```')) {
              y += `\nimport { ${imports.join(', ')} } from '${importFrom}'\n`
              inserted = true
            }
            return y
          }),
          unlines
        )(example)
    return fixed
  }
)

const commonFields = curry(
  (imports, { package: pkg, exported, name, summary, links, example }) => {
    // this is helpful but only if we opt-in, otherwise it's easy to insert invalid imports
    const ex = exported
      ? insertIntoExample(uniq([...imports, name]), pkg, example)
      : example
    return [
      name ? '## ' + name + '\n' : '',
      summary ? summary + '\n' : '',
      ex ? `### Usage\n${ex}` : '',
      ex.includes('live=true') ? `\n\n${liveExample(ex)}` : '',
      links.length ? `\n### See also\n - ${links.join('\n - ')}` : '',
    ]
  }
)

const handleCurriedExample = curry(function _handleCurriedExample(imports, x) {
  return pipe(
    wrap,
    ap([getCurried, flattenCommentData]),
    ([curried, { summary, links, package: pkg, exported }]) =>
      pipe(
        map(({ name, lines: example }) =>
          cleanlines(
            commonFields(imports, {
              package: pkg,
              exported,
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
        )
      )(curried),
    join('\n')
  )(x)
})

export const commentToMarkdown = curry(
  function _commentToMarkdown(slugName, imports, x) {
    return handleSpecialCases(
      pipe(
        ifElse(
          pipe(getCurried, length, lt(0)),
          handleCurriedExample(imports),
          pipe(
            flattenCommentData,
            ({ title, summary, links, example, package: pkg, exported }) =>
              cleanlines(
                commonFields(imports, {
                  exported,
                  package: pkg,
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
  }
)
