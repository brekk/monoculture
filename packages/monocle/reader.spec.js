import { readMonoFile, readAll, monoprocessor } from './reader'
import { resolve, fork } from 'fluture'

test('readMonoFile', done => {
  expect(readMonoFile).toBeTruthy()
  const readF = readMonoFile('zip/zap/zop', true, './cli.js')
  fork(done)(x => {
    expect(x.name).toEqual('../../../cli.js')
    expect(x.hash).toMatchSnapshot()
    done()
  })(readF)
})
const DIRFILES = [
  './cli.js',
  './config.js',
  './config.spec.js',
  './hash.js',
  './hash.spec.js',
  './index.js',
  './index.spec.js',
  './reader.js',
  './reader.spec.js',
  './trace.js',
]
test('readAll', done => {
  expect(readAll).toBeTruthy()
  const readDF = readAll({ showMatchesOnly: true }, './*')
  fork(done)(x => {
    expect(x).toEqual(DIRFILES)
    done()
  })(readDF)
})
test('monoprocessor', done => {
  expect(monoprocessor).toBeTruthy()
  const monoF = monoprocessor(
    { showMatchesOnly: true, trim: false, basePath: __dirname },
    resolve([]),
    './*'
  )
  fork(done)(z => {
    expect(z).toEqual(DIRFILES)
    done()
  })(monoF)
})
