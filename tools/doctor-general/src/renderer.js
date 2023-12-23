import { wrap } from 'inherent'
import {
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
import { lines, unlines } from './text'

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
  example: pathOr('', ['structure', 'example']),
})

const getCurried = pathOr([], ['structure', 'curried'])

const cleanlines = pipe(filter(I), join('\n'))

const handleCurriedExample = raw =>
  pipe(
    wrap,
    ap([getCurried, flattenCommentData]),
    ([curried, { summary: sharedSummary, links }]) =>
      map(({ name, summary, lines: example }) => {
        const allLinks = pipe(
          map(({ name: n }) => n),
          filter(y => y !== name),
          concat(links)
        )(curried)
        return cleanlines([
          name ? '## ' + name + '\n' : '',
          sharedSummary ? sharedSummary + '\n' : '',
          summary ? summary + '\n' : '',
          example ? `### Usage\n${example}` : '',
          example.includes('live=true') ? `\n\n${liveExample(example)}` : '',
          allLinks.length
            ? `\n#### See also\n - ${allLinks.join('\n - ')}`
            : '',
        ])
      })(curried),
    join('\n')
  )(raw)
export const commentToMarkdown = handleSpecialCases(
  pipe(
    ifElse(
      pipe(getCurried, length, lt(0)),
      handleCurriedExample,
      pipe(flattenCommentData, ({ title, summary, links, example }) =>
        cleanlines([
          title ? '## ' + title + '\n' : '',
          summary ? summary + '\n' : '',
          example ? `### Usage\n${example}` : '',
          example.includes('live=true') ? `\n\n${liveExample(example)}` : '',
          links.length ? `\n#### See also\n - ${links.join('\n - ')}` : '',
        ])
      )
    )
  )
)
