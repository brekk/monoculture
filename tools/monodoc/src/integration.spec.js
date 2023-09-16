// import { cwd } from 'node:process'
import { join, identity as I, pipe, map, propOr } from 'ramda'
import { fork } from 'fluture'
import { flexeca } from 'fl-utils'

const run = pipe(flexeca('./daffy-doc-cli.js'), map(propOr('', 'stdout')))

const goodrun = (args, expectation = I) =>
  test.skip(`daffy-doc ${join(' ')(args)}`, done => {
    pipe(
      run,
      fork(done)(z => {
        expectation(z)
        expect(z).toBeTruthy()
        expect(z).toMatchSnapshot()
        done()
      })
    )(args)
  })

goodrun([`fixture.ts`])
