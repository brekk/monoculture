import { readMonoFile, readAll, monoprocessor } from './reader'
import { resolve, fork } from 'fluture'

test('readMonoFile', done => {
  expect(readMonoFile).toBeTruthy()
  const readF = readMonoFile('zip/zap/zop', true, './src/cli.js')
  fork(done)(x => {
    expect(x.file).toEqual('../../../src/cli.js')
    expect(x.hash).toMatchSnapshot()
    done()
  })(readF)
})
const DIRFILES = [
  './src/cli.js',
  './src/config.js',
  './src/config.spec.js',
  './src/hash.js',
  './src/hash.spec.js',
  './src/index.js',
  './src/index.spec.js',
  './src/reader.js',
  './src/reader.spec.js',
  './src/trace.js',
]
test('readAll', done => {
  expect(readAll).toBeTruthy()
  const readDF = readAll({ showMatchesOnly: true }, './src/*')
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
    './src/*'
  )
  fork(done)(z => {
    expect(z).toEqual(DIRFILES)
    done()
  })(monoF)
})
