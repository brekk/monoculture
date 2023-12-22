// import { cwd } from 'node:process'
import { trace } from 'xtrace'
import {
  always as K,
  when,
  is,
  curry,
  pipe,
  map,
  join,
  identity as I,
  chain,
  propOr,
  both,
} from 'ramda'
import {
  join as pathJoin,
  relative,
  resolve as pathResolve,
  sep as SEPARATOR,
} from 'node:path'
import { fork, bimap } from 'fluture'
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

const executor = flexecaWithOptionsAndCancel(
  () => {},
  '../dist/doctor-general.cjs',
  {
    cwd: __dirname,
  }
)
const goodPath = propOr('', 'stdout')
const badPath = propOr('', 'stderr')

// it's a killable function
const killjoy = curry((done, fn, x) => (is(Function)(fn) ? fn(done)(x) : x))

// transforms need to provide their own `map` / `mapRej` / `chain` wrapping
const runner = curry((transforms, done, args) => {
  const fun = map(tr => killjoy(done, tr), transforms)
  return pipe(executor, bimap(badPath)(goodPath), ...fun)(args)
})

const testCLI = curry((transforms, postRun, finalAssertion, args) => {
  console.log({ transforms, postRun, finalAssertion, args })
  test(`doctor-general ${join(' ')(args)}`, done => {
    pipe(
      runner(transforms, done),
      killjoy(done, postRun),
      fork(e => {
        done(e)
      })(raw => {
        const finalRun = finalAssertion ? finalAssertion : (x, y) => y
        finalRun(done, raw)
        done()
      })
    )(args)
  })
})

const inFix = x =>
  './' + relative(process.cwd(), pathJoin(__dirname, './fixture/' + x))
const generated = x =>
  './' + relative(process.cwd(), pathJoin(__dirname, './' + x))

const GENERATED = generated('generated.json')
const GENERATED_FILES = generated('__generated__')
const FAKE_PACKAGE_JSON = inFix(`fake-pkg.json`)

testCLI(
  [
    curry((done, rawF) =>
      map(raw => {
        expect(stripAnsi(raw)).toMatchSnapshot()
      }, rawF)
    ),
  ],
  false,
  false,
  []
  // ['-i', FAKE_PACKAGE_JSON, '-a', GENERATED, '-o', GENERATED_FILES]
)

afterAll(done => {
  pipe(
    fork(done)(() => {
      console.log('cleanup!')
      done()
    })
  )(both(rimraf(GENERATED))(rimraf(GENERATED_FILES)))
})
