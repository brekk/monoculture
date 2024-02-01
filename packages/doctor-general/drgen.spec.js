import { fork } from 'fluture'
import { identity as I } from 'ramda'

import { readAndProcessFiles, drgen } from './drgen'

const RAW_CONFIG = {
  search: '**/*.js',
  interpreter: {
    process: I,
    renderer: (x, y) => y,
    group: 'cool',
    output: f => f.filename,
    postRender: (x, y) => y,
  },
  monorepo: false,
  input: ['../../package.json'],
  output: './temp.json',
  cwd: '.',
}

test('drgen - invalid interpreter', done => {
  const CONFIG = { ...RAW_CONFIG, showMatchesOnly: true }
  delete CONFIG.interpreter
  fork(e => {
    expect(e.toString()).toEqual(
      // eslint-disable-next-line max-len
      `Interpreter is invalid. Incorrect fields: output, group, process, renderer, postRender, postProcess`
    )
    done()
  })(done)(drgen(function cancel() {}, CONFIG))
})

test('drgen - just matches', done => {
  const CONFIG = { ...RAW_CONFIG, showMatchesOnly: true }
  fork(done)(x => {
    expect(x).toEqual(CONFIG.input)
    done()
  })(drgen(function cancel() {}, CONFIG))
})
/*
test('drgen - not just matches', done => {
  const CONFIG = { ...RAW_CONFIG }
  fork(done)(x => {
    expect(x).toEqual(CONFIG.input)
    done()
  })(drgen(function cancel() {}, CONFIG))
})
*/

test.skip('readAndProcessFiles', done => {
  fork(done)(x => {
    expect(x).toEqual('???')
    done()
  })(
    readAndProcessFiles(
      function cancel() {},
      { ...RAW_CONFIG, showMatchesOnly: true },
      {
        outputDir: __dirname,
        relativeArtifact: false,
        relative: I,
      },
      ['../../package.json']
    )
  )
})
