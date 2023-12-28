import { fork } from 'fluture'
import { exec } from './kiddo'

test('exec', done => {
  const blah = Math.round(Math.random() * 100000)
  fork(done)(z => {
    expect(z.stdout).toEqual('' + blah)
    done()
  })(exec('echo', [blah]))
})
