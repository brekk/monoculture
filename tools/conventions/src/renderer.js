import {
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

export const commentToMarkdown = ifElse(
  // this is a special case where we want to be able to dynamically rename the page
  pathOr(false, ['structure', 'page']),
  // but since we're cheating we don't want to list it as a comment
  K(''),
  pipe(
    applySpec({
      title: pathOr('Unknown', ['structure', 'name']),
      summary: propOr('?', 'summary'),
      links: propOr([], 'links'),
      example: pathOr('', ['structure', 'example']),
    }),
    ({ title, summary, links, example }) =>
      [
        title ? '## ' + title + '\n' : '',
        summary ? summary + '\n' : '',
        links.length ? '### See also\n - ' + links.join('\n - ') + '\n' : '',
        example ? '### Usage\n' + example : '',
        example.includes('live=true') ? `\n\n${liveExample(example)}` : '',
      ].join('')
  )
)
