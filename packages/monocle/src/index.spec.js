import path from 'node:path'
import { fork } from 'fluture'
import { toPairs, pipe, map, trim, reduce, invertObj, filter } from 'ramda'
import { reader, monoprocessor } from './reader'

test('reader', done => {
  const files = reader({ basePath: __dirname }, path.join(__dirname, '/*'))
  fork(e => {
    // eslint-disable-next-line no-console
    console.warn(e)
    done()
  })(
    pipe(z => {
      // eslint-disable-next-line no-console
      console.log('oh yeah', z)
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
    name: 't-words',
    dependencies: [],
    processLine: true,
    fn: (c, line) => line.split(' ').filter(z => z.startsWith('t')).length,
  },
]

test('monoprocessor', done => {
  fork(done)(x => {
    const {
      state: { basePath, ...rawState },
    } = x
    expect(Object.keys(rawState)).toEqual(['t-words', 'wordcount'])
    const filesExcludingSpecs = pipe(
      invertObj,
      toPairs,
      filter(([k]) => !k.includes('spec'))
    )(x.hashMap)
    expect(filesExcludingSpecs).toEqual([
      [
        'hash.js',
        '5cd99d9df3d8e4c2fcc83cf248314a4836c71d88f8d6e4fdc0d84c4e8c7b029d',
      ],
      [
        'index.js',
        'c58cb552a847bf29bec7e5c61d15cf07bbb9a000b8b0a565c7981c29ebf00f5a',
      ],
      [
        'reader.js',
        '787c5dde1d1b8771ea5835005d0b4a3e4450e8a574da8cbb1999b35339e29c78',
      ],
    ])
    const keepHashes = filesExcludingSpecs.reduce(
      (agg, [f, hash]) => agg.concat(hash),
      []
    )
    expect(
      filter(([hash, count]) => keepHashes.includes(hash), rawState.wordcount)
    ).toEqual([
      ['5cd99d9df3d8e4c2fcc83cf248314a4836c71d88f8d6e4fdc0d84c4e8c7b029d', 27],
      ['c58cb552a847bf29bec7e5c61d15cf07bbb9a000b8b0a565c7981c29ebf00f5a', 44],
      ['787c5dde1d1b8771ea5835005d0b4a3e4450e8a574da8cbb1999b35339e29c78', 411],
    ])
    done()
  })(
    monoprocessor({ basePath: __dirname }, PLUGINS, path.join(__dirname, '/*'))
  )
})
