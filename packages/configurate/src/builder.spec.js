import { fork } from 'fluture'
import { map } from 'ramda'
import {
  NO_OP,
  showHelpWhen,
  configurateWithOptions,
  configFile,
} from './builder'
/* eslint-disable max-len */

test('NO_OP', () => {
  expect(NO_OP).toBeTruthy()
  expect(NO_OP()).toBeFalsy()
})
test('showHelpWhen', () => {
  expect(showHelpWhen).toBeTruthy()
  expect(showHelpWhen(() => true, {})).toBeTruthy()
  expect(showHelpWhen(() => false, { help: true })).toBeTruthy()
  expect(showHelpWhen(() => false, {})).toBeFalsy()
})
test('configurateWithOptions', done => {
  expect(configurateWithOptions).toBeTruthy()
  const confF = configurateWithOptions(
    {},
    { alias: { yo: ['y'] } },
    { yo: 'yes' },
    { yo: 'This is a yo flag, young hopper', help: 'help!' },
    { name: 'barksdale' },
    ['-y', 'hey']
  )
  fork(done)(x => {
    expect(x).toEqual({
      _: [],
      y: 'hey',
      yo: 'hey',
      HELP: `barksdale\n\n  -y / --yo\n  \tThis is a yo flag, young hopper\n\n  -h / --help\n  \thelp!`,
    })
    done()
  })(confF)
})
test('configurateWithOptions - with help boolean', done => {
  expect(configurateWithOptions).toBeTruthy()
  const confF = configurateWithOptions(
    {},
    { alias: { yo: ['y'] }, boolean: ['help'] },
    { yo: 'yes' },
    { yo: 'This is a yo flag, young hopper', help: 'help!' },
    { name: 'barksdale' },
    ['-y', 'hey']
  )
  fork(done)(x => {
    expect(x).toEqual({
      _: [],
      y: 'hey',
      yo: 'hey',
      HELP: `barksdale\n\n  -y / --yo\n  \tThis is a yo flag, young hopper\n\n  -h / --help\n  \thelp!`,
    })
    done()
  })(confF)
})
test('configurateWithOptions - with other booleans', done => {
  expect(configurateWithOptions).toBeTruthy()
  const confF = configurateWithOptions(
    {},
    { alias: { yo: ['y'] }, boolean: ['yo'] },
    { yo: true },
    { yo: 'yo flag', help: 'help!' },
    { name: 'barksdale' },
    ['-y']
  )
  fork(done)(x => {
    expect(x).toEqual({
      _: [],
      y: true,
      yo: true,

      HELP: `barksdale\n\n  -y / --yo\n  \tyo flag\n\n  -h / --help\n  \thelp!`,
    })
    done()
  })(confF)
})
const TEST_CONF_RAW = { fixture: 'test', info: 'this is a test file' }
test('configFile - load', done => {
  expect(configFile).toBeTruthy()
  const confF = configFile({ ns: 'testconf' })
  fork(done)(x => {
    expect(x).toEqual(TEST_CONF_RAW)
    done()
  })(confF)
})

test('configFile - direct file', done => {
  const confF = configFile(__dirname + '/../.testconfrc')
  fork(done)(x => {
    expect(x).toEqual(TEST_CONF_RAW)
    done()
  })(confF)
})

test('configFile - direct file as source', done => {
  const confF = configFile({
    source: __dirname + '/../.testconfrc',
    // json: false,
    json: false,
    transformer: map(JSON.parse),
    wrapTransformer: false,
  })
  fork(done)(x => {
    expect(x).toEqual(TEST_CONF_RAW)
    done()
  })(confF)
})

test('configFile - direct file, no transformer', done => {
  const confF = configFile({
    source: __dirname + '/../.testconfrc',
    // json: false,
    json: false,
    wrapTransformer: true,
  })
  fork(done)(x => {
    expect(x).toEqual(JSON.stringify(TEST_CONF_RAW, null, 2) + '\n')
    done()
  })(confF)
})
