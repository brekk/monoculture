import { fork } from 'fluture'
import { flexeca } from './flexeca'

test('flexeca', done => {
  const blah = Math.round(Math.random() * 100000)
  fork(done)(z => {
    expect(z.stdout).toEqual('' + blah)
    done()
  })(flexeca('echo', [blah]))
})
