import path from 'node:path'
import { fork } from 'fluture'
import { toPairs, pipe, map, trim, reduce, invertObj, filter } from 'ramda'
import { reader, monoprocessor } from './reader'

test('reader', done => {
  const files = reader(
    {
      ignore: [path.join(__dirname, '*.spec.js')],
      basePath: __dirname,
    },
    path.join(__dirname, '/*')
  )
  fork(e => {
    // eslint-disable-next-line no-console
    console.warn(e)
    done()
  })(
    pipe(z => {
      expect(Object.keys(z)).toEqual(['content', 'files'])
      // eslint-disable-next-line no-console
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
    const { state: rawState } = x
    const stateKeys = Object.keys(rawState)

    expect(stateKeys.includes('t-words')).toBeTruthy()
    expect(stateKeys.includes('wordcount')).toBeTruthy()

    expect(rawState.wordcount).toEqual([
      ['5cd99d9df3d8e4c2fcc83cf248314a4836c71d88f8d6e4fdc0d84c4e8c7b029d', 27],
      ['c58cb552a847bf29bec7e5c61d15cf07bbb9a000b8b0a565c7981c29ebf00f5a', 44],
      ['6351420d863bbf1b0ce0b322f6e5077759d9f60981cab05c92fe4ada76be7010', 387],
    ])
    done()
  })(
    monoprocessor(
      {
        basePath: __dirname,
        nodir: true,
        // dot: true,
        ignore: [path.join(__dirname, '*.spec.js')],
      },
      PLUGINS,
      path.join(__dirname, '/**')
    )
  )
})
