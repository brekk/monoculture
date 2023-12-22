import path from 'node:path'
import { resolve, fork } from 'fluture'
import { pipe, map, prop, trim, reduce } from 'ramda'
import { readAll, monoprocessor } from './reader'
import * as EVERYTHING from './index'

test('default export', () => {
  expect(Object.keys(EVERYTHING)).toEqual([
    'hash',
    'monoprocessor',
    'readAll',
    'readMonoFile',
  ])
})
const DDD = process.cwd()
const IGNORE = [
  path.join(DDD, '*.spec.js'),
  '**/__snapshots__/**',
  '**/coverage/**',
  '**/dist/**',
]

test('readAll', done => {
  const files = readAll(
    {
      // if we don't ignore this file and snapshots,
      // we have an asymptotically infinite amount of effort
      ignore: IGNORE,
      basePath: DDD,
      cwd: DDD,
    },
    path.join(__dirname, '/*')
  )
  fork(done)(
    pipe(z => {
      const out = map(prop('hash'))(z)
      expect(out).toMatchSnapshot()
      done()
    })
  )(files)
})

const PLUGINS = [
  {
    default: {
      name: 'wordcount',
      dependencies: [],
      fn: (c, f) =>
        pipe(
          map(([, lineContent]) => lineContent.split(' ').map(trim).length),
          reduce((a, b) => a + b, 0)
        )(f.body),
    },
  },
  {
    default: {
      name: 'c-words',
      dependencies: [],
      preserveLine: true,
      fn: (c, line) => line.split(' ').filter(z => z.startsWith('c')).length,
    },
  },
]

test('monoprocessor', done => {
  fork(done)(x => {
    expect(x.state).toMatchSnapshot()
    done()
  })(
    monoprocessor(
      {
        basePath: __dirname,
        cwd: __dirname,
        nodir: true,
        // don't read test files, don't read snapshots
        ignore: IGNORE,
      },
      resolve(PLUGINS),
      path.join(__dirname, '/**')
    )
  )
})
