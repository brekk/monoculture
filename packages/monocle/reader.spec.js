import { readMonoFile, readAll, monoprocessor } from './reader'
import { reject, pipe, includes } from 'ramda'
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
  './graph.svg',
  './hash.js',
  './hash.spec.js',
  './index.js',
  './index.spec.js',
  './jest.config.cjs',
  './log.js',
  './package-scripts.cjs',
  './package.json',
  './reader.js',
  './reader.spec.js',
  './README.md',
]
const noReports = reject(includes('ci-report'))
const noSelfRef = reject(includes('monocle'))
const cleanStuff = pipe(noReports, noSelfRef)
test('readAll', done => {
  expect(readAll).toBeTruthy()
  const readDF = readAll(
    { ignore: ['./**/ci-report.json'], showMatchesOnly: true },
    './*'
  )
  fork(done)(x => {
    expect(cleanStuff(x)).toEqual(DIRFILES)
    done()
  })(readDF)
})
test('monoprocessor', done => {
  expect(monoprocessor).toBeTruthy()
  const monoF = monoprocessor(
    {
      showMatchesOnly: true,
      trim: false,
      basePath: __dirname,
      ignore: ['./**/ci-report.json'],
    },
    resolve([]),
    './*'
  )
  fork(done)(x => {
    expect(cleanStuff(x)).toEqual(DIRFILES)
    done()
  })(monoF)
})
