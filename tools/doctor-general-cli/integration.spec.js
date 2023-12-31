// import { cwd } from 'node:process'
import { trace } from 'xtrace'
import { is, curry, pipe, map, join } from 'ramda'
import { join as pathJoin, relative } from 'node:path'
import { fork } from 'fluture'
import { execWithConfig } from 'kiddo'

test('smoke', () => {
  expect(true).toBeTruthy()
})

const exe = execWithConfig(
  () => {},
  relative(__dirname, './dist/doctor-general.cjs'),
  {
    cwd: process.cwd(),
  }
)
// const goodPath = propOr('', 'stdout')
// const badPath = propOr('', 'stderr')

// it's a killable function
const killjoy = curry(function _killjoy(done, fn, x) {
  return is(Function)(fn) ? fn(done)(x) : x
})

// transforms need to provide their own `map` / `mapRej` / `chain` wrapping
const runner = curry(function _runner(transforms, done, args) {
  const fun = map(tr => killjoy(done, tr), transforms)
  return pipe(exe, ...fun)(args)
})

const testCLI = curry(
  function _testCLI(transforms, postRun, finalAssertion, args) {
    test(`doctor-general ${join(' ')(args)}`, done => {
      pipe(
        runner(transforms, done),
        map(trace('run')),
        killjoy(done, postRun),
        map(trace('postrun')),
        fork(e => {
          done(e)
        })(raw => {
          if (is(Function)(finalAssertion)) {
            finalAssertion(done)(raw)
          } else {
            done()
          }
        })
      )(args)
    })
  }
)

// testCLI(
//   [
//     curry((done, rawF) =>
//       map(raw => {
//         expect(stripAnsi(raw)).toMatchSnapshot()
//       }, rawF)
//     ),
//   ],
//   false,
//   false,
//   []
// )

const inFix = x =>
  './' + relative(process.cwd(), pathJoin(__dirname, '../fixture/' + x))
const generated = x =>
  './' + relative(process.cwd(), pathJoin(__dirname, '../' + x))

const GENERATED = generated('generated.json')
const GENERATED_FILES = generated('__generated__')
const FAKE_PACKAGE_JSON = inFix(`fake-pkg.json`)
/*
testCLI(
  [],
  false,
  curry((done, raw) => {
    console.log({ done, raw })
    return pipe(
      trace('preparing to read'),
      readFile,
      map('raw'),
      map(JSON.parse),
      fork(done)(z => {
        expect(z).toEqual('>>>>')
        done()
      })
    )(GENERATED)
  }),
  ['-i', FAKE_PACKAGE_JSON, '-a', GENERATED, '-o', GENERATED_FILES]
)
*/

// test('ragequit', done => {
//   fork(bad => {
//     console.log({ bad, type: typeof bad })
//     expect(bad).toEqual('something')
//     done()
//   })(good => {
//     expect(good).toEqual('something')
//     done()
//   })(exe(['-i', FAKE_PACKAGE_JSON, '-a', GENERATED, '-o', GENERATED_FILES]))
// })

// afterAll(done => {
//   pipe(
//     fork(done)(_x => {
//       // console.log('removed!', _x)
//       done()
//     })
//   )(parallel(10)([rimraf(GENERATED), rimraf(GENERATED_FILES)]))
// })
