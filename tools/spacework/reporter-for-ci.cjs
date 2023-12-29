#!/usr/bin/env node
const {
  any,
  startsWith,
  head,
  prepend,
  nth,
  propOr,
  slice,
  trace,
  C,
  filter,
  fork,
  identity: I,
  lines,
  map,
  pipe,
  readStdin,
  tail,
  reduce,
  split,
  trim,
  unlines,
  j2,
} = require('snang/script')
const perc = z => z + '%'
const summarizeNode = (project, s, b, f, l) =>
  `**${project}**: ${printSummary(s, b, f, l)}`
const printSummary = (s, b, f, l) =>
  [s, b, f, l].map(z => `\`${z}\``).join(' / ')

module.exports = pipe(
  readStdin,
  map(
    pipe(
      split(/\n\s{1}(\S+)/),
      map(lines),
      slice(1, Infinity),
      reduce(
        ({ active, stack }, [h, ...t]) => {
          if (!active && !t.length) {
            return { active: h, stack }
          }
          if (t.length) {
            const summary = h
              .trim()
              .split('|')
              .map(z => z.trim())
              .filter(I)
            const [statements, branches, functions, l] = summary
            const files = t
              .map(y =>
                y
                  .trim()
                  .split('|')
                  .map(z => z.trim())
                  .slice(0, -1)
              )
              .filter(y => !any(startsWith('----'), y))
              .map(([n, s, b, f, l2]) => ({
                name: n,
                s: perc(s),
                b: perc(b),
                f: perc(f),
                l: perc(l2),
              }))
            stack.push({
              project: active.split('/')[1],
              s: perc(statements),
              b: perc(branches),
              f: perc(functions),
              l: perc(l),
              files,
            })
            active = null
          } else {
            active = h
          }
          return { active, stack }
        },
        { active: null, stack: [] }
      ),
      propOr([], 'stack'),
      slice(0, -1),
      map(({ project, s, b, f, l, files }) => {
        const sum = summarizeNode(project, s, b, f, l)
        return ` * <details closed><summary>${sum}</summary>

   - ${files
     .map(({ name, s: s2, b: b2, f: f2, l: l2 }) =>
       summarizeNode(name, s2, b2, f2, l2)
     )
     .join('\n   - ')}

   </details>\n`
      }),
      unlines
    )
  ),
  fork(console.error, console.log)
)(process.argv.slice(2)[0])
