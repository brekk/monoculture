import { resolve as resolveF, fork } from 'fluture'
import { writeArtifact } from './writer'
import { removeFileWithConfig } from 'file-system'
import U from 'unusual'

const u = U('my-cool-seeded-generator')

const GEN_DIR = 'generated-fake-dir'
const GENERATED = GEN_DIR + '/temp.json'

test('writeArtifact', done => {
  const r = 'random' + u.integer({ min: 0, max: 1e3 })
  fork(done)(x => {
    expect(x).toEqual(r)
    done()
  })(writeArtifact(GENERATED, resolveF(r)))
})

afterAll(done => {
  fork(done)(() => {
    done()
  })(removeFileWithConfig({ force: true, recursive: true }, GEN_DIR))
})
