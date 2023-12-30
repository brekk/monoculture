#!/usr/bin/env node
const yargsParser = require('yargs-parser')
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
const REPO = 'https://github.com/brekk/monoculture/blob/main'

const summarizeLinkedNode = (filepath, project, s, b, f, l) =>
  `[${project}](${REPO}/${filepath}/${project})  ${printSummary(s, b, f, l)}`

const printSummary = (s, b, f, l) =>
  [s, b, f, l].map(z => `\`${z}\``).join(' / ')

const YARGS_CONFIG = {
  alias: {
    pr: ['p'],
    branch: ['b'],
  },
  configuration: {
    'strip-aliased': true,
  },
}

function reporter(args) {
  return pipe(
    raw => yargsParser(raw, YARGS_CONFIG),
    ({ _: parsedArguments, pr, branch }) =>
      pipe(
        trace('pre-split'),
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
              const pathParts = active.split('/')
              stack.push({
                path: pathParts.slice(0, 2).join('/'),
                project: pathParts[1],
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
        map(
          ({ project, s, b, f, l, path, files }) =>
            // eslint-disable-next-line max-len
            `\n * <details closed><summary><strong><a href="${REPO}/${path}">${project}</a></strong> (<code>${s}</code> / <code>${b}</code> / <code>${f}</code> / <code>${l}</code>)</summary>

   - ${files
     .map(({ name, s: s2, b: b2, f: f2, l: l2 }) =>
       summarizeLinkedNode(path, name, s2, b2, f2, l2)
     )
     .join('\n   - ')}

   </details>`
        ),
        unlines
      )(parsedArguments.join('\n')),
    console.log
    // eslint-disable-next-line no-console
    // fork(console.error, console.log)
  )(args)
}
const ARGS = process.argv.slice(2)
reporter(ARGS)
