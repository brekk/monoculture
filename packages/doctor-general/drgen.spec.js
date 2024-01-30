import { resolve as resolveF, fork } from 'fluture'
import { identity as I } from 'ramda'

import { drgen } from './drgen'

test('drgen - as little as possible', done => {
  const CONFIG = {
    search: '**/*.js',
    showMatchesOnly: true,
    processor: resolveF({
      process: I,
      renderer: (x, y) => y,
      group: 'cool',
      output: f => f.filename,
    }),
    monorepo: false,
    input: ['../../package.json'],
    output: './temp.json',
    cwd: '.',
  }
  fork(done)(x => {
    expect(x).toEqual(CONFIG.input)
    done()
  })(drgen(function cancel() {}, CONFIG))
})
