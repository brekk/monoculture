import { log } from './git'
import { fork } from 'fluture'

test('git', done => {
  expect(log).toBeTruthy()
  fork(done)(x => {
    expect(x).toBeTruthy()
    console.log('XX', x)
    done()
  })(log({ repo: __dirname }))
})
