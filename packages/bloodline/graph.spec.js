import { fork } from 'fluture'
import { checkForGraphviz } from './graph'

// we can test this but it will fail on CI, so skip for now
test.skip('checkForGraphviz', done => {
  expect(checkForGraphviz).toBeTruthy()
  fork(done)(x => {
    expect(x).toBeTruthy()
    done()
  })(checkForGraphviz(''))
})
