// import { cwd } from 'node:process'
import { resolve as pathResolve, sep as SEPARATOR } from 'node:path'
import stripAnsi from 'strip-ansi'
import { join, identity as I, pipe, map, propOr } from 'ramda'
import { fork, both } from 'fluture'
import { flexeca, removeFile, rimraf, readFile } from 'file-system'
import { fence } from './string'

const run = pipe(flexeca('./monodoc-cli.js'), map(propOr('', 'stdout')))

const goodrun = (args, expectation = I) =>
  test(`monodoc ${join(' ')(args)}`, done => {
    pipe(
      run,
      fork(done)(z => {
        expectation(done, z)
      })
    )(args)
  })

const inFix = x =>
  '.' +
  SEPARATOR +
  fence(SEPARATOR, -2, pathResolve(__dirname, '../fixture', x))

const GENERATED = inFix('generated.json')
const GENERATED_FILES =
  '.' +
  SEPARATOR +
  fence(SEPARATOR, -2, pathResolve(__dirname, '../__generated__'))
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
