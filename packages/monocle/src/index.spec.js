import path from 'node:path'
import { fork } from 'fluture'
import { pipe } from 'ramda'
import { reader } from './reader'

test('reader', done => {
  const files = reader({ basePath: __dirname }, path.join(__dirname, '/*'))
  // eslint-disable-next-line no-console
  fork(console.warn)(
    pipe(z => {
      // eslint-disable-next-line no-console
      console.log('oh yeah', z)
      done()
    })
  )(files)
})
