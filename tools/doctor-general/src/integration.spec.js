// import { cwd } from 'node:process'
import { pipe, map, join, identity as I, propOr, both } from 'ramda'
import {
  join as pathJoin,
  relative,
  resolve as pathResolve,
  sep as SEPARATOR,
} from 'node:path'
import { fork } from 'fluture'
import stripAnsi from 'strip-ansi'
import {
  readFile,
  flexecaWithOptionsAndCancel,
  removeFile,
  rimraf,
} from 'file-system'
import { nthIndex } from 'knot'

test('smoke', () => {
  expect(true).toBeTruthy()
})

const run = pipe(
  flexecaWithOptionsAndCancel(() => {}, '../dist/doctor-general.cjs', {
    cwd: __dirname,
  }),
  map(propOr('', 'stdout'))
)

const goodrun = (args, expectation = I) =>
  test(`doctor-general ${join(' ')(args)}`, done => {
    pipe(
      run,
      fork(done)(z => {
        expectation(done, z)
      })
    )(args)
  })

const inFix = x =>
  nthIndex(SEPARATOR, -2, pathResolve(__dirname, '../fixture/' + x))

const GENERATED = inFix('generated.json')
const GENERATED_FILES = inFix('__generated__')
const FAKE_PACKAGE_JSON = inFix(`fake-pkg.json`)

goodrun(
  ['-i', FAKE_PACKAGE_JSON, '-a', GENERATED, '-o', GENERATED_FILES],
  (done, raw) => {
    expect(stripAnsi(raw)).toMatchSnapshot()
    fork(done)(z => {
      // expect(z).toBeTruthy()
      expect(z).toMatchSnapshot()
      done()
    })(map(JSON.parse, readFile(GENERATED)))
  }
)
afterAll(done => {
  pipe(
    fork(done)(() => {
      done()
    })
  )(both(removeFile(GENERATED))(rimraf(GENERATED_FILES)))
})
