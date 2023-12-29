#!/usr/bin/env node
const {
  prepend,
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
      prepend(['\n_Legend_: Statements / Branches / Functions / Lines\n']),
      map(([name, st, br, fn, ln]) =>
        st
          ? ` * **${name}**: \`${st}%\` / \`${br}%\` / \`${fn}%\` / \`${ln}%\``
          : name
      ),
      unlines
    )
  ),
  fork(console.error, console.log)
)(process.argv.slice(2)[0])
