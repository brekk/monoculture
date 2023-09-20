import path from 'node:path'
import { fork } from 'fluture'
import { pipe } from 'ramda'
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
  // {name: 'a', fn: (x) =>
]

test('monoprocessor', done => {
  fork(done)(x => {
    console.log('RAW', x)
    done()
  })(
    monoprocessor({ basePath: __dirname }, PLUGINS, path.join(__dirname, '/*'))
  )
})
