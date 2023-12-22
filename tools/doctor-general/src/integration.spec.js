// import { cwd } from 'node:process'
test('smoke', () => {
  expect(true).toBeTruthy()
})

/*
const run = pipe(flexeca('./drgen.js'), map(propOr('', 'stdout')))

const goodrun = (args, expectation = I) =>
  test.skip(`doctor-general ${join(' ')(args)}`, done => {
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
  nthIndex(SEPARATOR, -2, pathResolve(__dirname, '../fixture', x))

const GENERATED = inFix('generated.json')
const GENERATED_FILES =
  '.' +
  SEPARATOR +
  nthIndex(SEPARATOR, -2, pathResolve(__dirname, '../__generated__'))
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
*/
