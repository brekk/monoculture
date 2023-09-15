#!/usr/bin/env node

const {
  applySpec,
  fork,
  map,
  pipe,
  readFile,
  unlines,
  propOr,
  pathOr,
} = require('snang/script')

const prettyPrint = pipe(
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
    ].join('')
)

module.exports = pipe(
  readFile,
  map(
    pipe(
      JSON.parse,
      map(
        ({ filename: f, comments: c }) =>
          `# ${f}\n${pipe(map(prettyPrint), unlines)(c)}`
      ),
      unlines
    )
  ),
  // eslint-disable-next-line no-console
  fork(console.error, console.log)
)(process.argv.slice(2)[0])
