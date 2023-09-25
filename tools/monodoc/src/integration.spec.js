// import { cwd } from 'node:process'
import { join, identity as I, pipe, map, propOr } from 'ramda'
import { fork } from 'fluture'
import { flexeca } from 'file-system'

const run = pipe(flexeca('./monodoc-cli.js'), map(propOr('', 'stdout')))

const goodrun = (args, expectation = I) =>
  test(`monodoc ${join(' ')(args)}`, done => {
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
