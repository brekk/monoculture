import { gitlog } from './git'
import { fork } from 'fluture'

test('gitlog', done => {
  expect(gitlog).toBeTruthy()
  fork(done)(x => {
    expect(x).toBeTruthy()
    console.log('XX', x)
    done()
  })(gitlog({ repo: __dirname }))
})
