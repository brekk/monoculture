import path from 'node:path'
import { fork } from 'fluture'
import { hash } from './hash'
import { readFile } from 'file-system'

test('hash', done => {
  fork(done)(raw => {
    // this is wildly self-documenting
    expect(hash(raw)).toMatchSnapshot()
    done()
  })(readFile(path.resolve(__dirname, 'hash.js')))
})
