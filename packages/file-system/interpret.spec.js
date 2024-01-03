import { fork } from 'fluture'
import { interpret } from './interpret'

test('interpret', done => {
  expect(interpret).toBeTruthy()
  fork(done)(x => {
    expect(x).toEqual({ input: 'this is a fixture' })
    done()
  })(interpret('./fixture/raw.js'))
})
