import path from 'node:path'
import { fork } from 'fluture'
import { pipe, map, prop, trim, reduce } from 'ramda'
import { readAll, monoprocessor } from './reader'
import * as EVERYTHING from './index'

test('default export', () => {
  expect(Object.keys(EVERYTHING)).toEqual([
    'hash',
    'readMonoFile',
    'readAll',
    'monoprocessor',
  ])
})

test('readAll', done => {
  const files = readAll(
    {
      // if we don't ignore this file and snapshots,
      // we have an asymptotically infinite amount of effort
      ignore: [path.join(__dirname, '*.spec.js'), '**/__snapshots__/**'],
      basePath: __dirname,
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
    name: 'wordcount',
    dependencies: [],
    fn: (c, f) =>
      pipe(
        map(([, lineContent]) => lineContent.split(' ').map(trim).length),
        reduce((a, b) => a + b, 0)
      )(f.body),
  },
  {
    name: 'c-words',
    dependencies: [],
    preserveLine: true,
    fn: (c, line) => line.split(' ').filter(z => z.startsWith('c')).length,
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
        nodir: true,
        // don't read test files, don't read snapshots
        ignore: [path.join(__dirname, '*.spec.js'), '**/__snapshots__/*.snap'],
      },
      PLUGINS,
      path.join(__dirname, '/**')
    )
  )
})
