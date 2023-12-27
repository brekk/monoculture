import { curry, pipe, toPairs, map, keys, join } from 'ramda'
import { strepeat } from 'knot'

export const depUsage = curry(({ repo }, deps, devDeps) =>
  pipe(
    toPairs,
    map(
      ([k, v]) =>
        (v.startsWith('workspace:')
          ? `[${k}](${repo}/${v.slice(v.indexOf(':') + 1)}) 🦴`
          : `[${k}](https://www.npmjs.com/package/${k})`) +
        (keys(devDeps).includes(k) ? ' 🧪' : '')
    ),
    join('\n      - ')
  )({ ...deps, ...devDeps })
)

export const docLinks = curry((indent, docURL, project, docs) => {
  const i = strepeat(' ', indent)
  return docs.length
    ? pipe(
        map(({ filename: f }) => {
          const raw = f.slice(f.indexOf('/') + 1, f.indexOf('.'))
          const key = raw.slice(raw.indexOf('/') + 1)
          return `[${key}](${docURL}/${raw})`
        }),
        join(`\n${i} - `),
        z => ` - ${z}`
      )(docs)
    : ''
})
