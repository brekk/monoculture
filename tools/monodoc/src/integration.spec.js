// import { cwd } from 'node:process'
import { join, identity as I, pipe, map, propOr } from 'ramda'
import { fork } from 'fluture'
import { flexeca } from 'file-system'
import { trace } from 'xtrace'

const run = pipe(
  flexeca('./monodoc-cli.js'),
  map(trace('raw')),
  map(propOr('', 'stdout'))
)

const goodrun = (args, expectation = I) =>
  test(`monodoc ${join(' ')(args)}`, done => {
    pipe(
      run,
      map(trace('raw')),
      fork(done)(z => {
        expectation(done, z)
      })
    )(args)
  })

const generated = './generated.json'
/*
goodrun(
  ['-i', `fixture-monorepo-package.json`, '-a', generated],
  (done, raw) => {
    expect(stripAnsi(raw)).toMatchSnapshot()
    fork(done)(z => {
      // expect(z).toBeTruthy()
      expect(z).toEqual('blabbo')
      done()
    })(readFile(generated))
  }
)
*/
test('smoke', () => {
  expect(true).toBeTruthy()
})
