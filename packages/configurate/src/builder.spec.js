import { fork } from 'fluture'
import {
  showHelpWhen,
  configurateWithOptions,
  configurate,
  spaceconfig,
  configFile,
  configSearch,
} from './builder'

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
    'barksdale',
    ['-y', 'hey']
  )
  fork(done)(x => {
    expect(x).toEqual({ _: [], y: 'hey', yo: 'hey' })
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
    'barksdale',
    ['-y', 'hey']
  )
  fork(done)(x => {
    expect(x).toEqual({ _: [], y: 'hey', yo: 'hey' })
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
    'barksdale',
    ['-y']
  )
  fork(done)(x => {
    expect(x).toEqual({ _: [], y: true, yo: true })
    done()
  })(confF)
})
const TEST_CONF_RAW = { fixture: 'test', info: 'this is a test file' }
test('spaceconfig - load', done => {
  expect(spaceconfig).toBeTruthy()
  const confF = spaceconfig({}, 'testconf', __dirname + '/../.testconfrc')
  fork(done)(({ config: x }) => {
    expect(x).toEqual(TEST_CONF_RAW)
    done()
  })(confF)
})
test('spaceconfig - search', done => {
  expect(spaceconfig).toBeTruthy()
  const confF = spaceconfig({}, 'testconf', false)
  fork(done)(({ config: x }) => {
    expect(x).toEqual(TEST_CONF_RAW)
    done()
  })(confF)
})
