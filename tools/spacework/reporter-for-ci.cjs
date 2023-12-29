#!/usr/bin/env node
const {
  nth,
  C,
  filter,
  fork,
  identity: I,
  lines,
  map,
  pipe,
  readStdin,
  split,
  trim,
  unlines,
} = require('snang/script')

module.exports = pipe(
  readStdin,
  map(
    pipe(
      lines,
      filter(y => y[0] === ' ' && y[1] !== ' '),
      map(split(C.p)),
      map(map(trim)),
      map(([n, ...rest]) => {
        const y = split('/', n)
        return [nth(1, y), ...rest]
      }),
      map(
        ([name, st, br, fn, ln]) =>
          ` * **${name}**: \`${st}%\` / \`${br}%\` / \`${fn}%\` / \`${ln}%\``
      ),
      unlines
    )
  ),
  fork(console.error, console.log)
)(process.argv.slice(2)[0])
