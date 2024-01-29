import { resolve as resolveF, fork } from 'fluture'
import { writeArtifact } from './writer'
import { removeFile } from 'file-system'
import U from 'unusual'

const u = U('my-cool-seeded-generator')

const GENERATED = 'generated-fake.json'

test('writeArtifact', done => {
  const r = u.integer({ min: 0, max: 1e3 })
  fork(done)(x => {
    expect(x).toEqual(r)
    done()
  })(writeArtifact(GENERATED, resolveF(r)))
})

afterEach(done => {
  fork(done)(() => {
    done()
  })(removeFile(GENERATED))
})
