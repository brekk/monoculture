import { fork } from 'fluture'
import { parse as tomlparse } from 'smol-toml'
import { pipe, map } from 'ramda'
import { NO_OP, showHelpWhen, configurate, configFile } from './builder'
/* eslint-disable max-len */

const j2 = z => JSON.stringify(z, null, 2)
const j2n = pipe(j2, z => z + '\n')

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
test('configurate', done => {
  expect(configurate).toBeTruthy()
  const confF = configurate(
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
test('configurate - with help boolean', done => {
  expect(configurate).toBeTruthy()
  const confF = configurate(
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
test('configurate - with other booleans', done => {
  expect(configurate).toBeTruthy()
  const confF = configurate(
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
  const confF = configFile({ ns: 'testconf', json: true })
  fork(done)(x => {
    expect(x).toEqual(TEST_CONF_RAW)
    done()
  })(confF)
})

test('configFile - direct file', done => {
  const confF = configFile(__dirname + '/.testconfrc')
  fork(done)(x => {
    expect(x).toEqual(j2n(TEST_CONF_RAW))
    done()
  })(confF)
})

test('configFile - direct file as source', done => {
  const confF = configFile({
    source: __dirname + '/.testconfrc',
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
    source: __dirname + '/.testconfrc',
    wrapTransformer: true,
  })
  fork(done)(x => {
    expect(x).toEqual(JSON.stringify(TEST_CONF_RAW, null, 2) + '\n')
    done()
  })(confF)
})
test('configFile - toml transformer', done => {
  const confF = configFile({
    source: __dirname + '/.testtomlconfrc',
    transformer: tomlparse,
    wrapTransformer: true,
  })
  fork(done)(x => {
    expect(x).toEqual(TEST_CONF_RAW)
    done()
  })(confF)
})

test('configFile - multiple transformer', done => {
  fork(done)(raw => {
    expect(raw).toEqual(TEST_CONF_RAW)
    done()
  })(
    configFile({
      ns: 'testtomlconf',
      transformer: [
        {
          name: 'toml',
          test: () => true,
          parse: tomlparse,
        },
      ],
    })
  )
})

// TODO - move the plugin validation upstream rather than this
test.skip('configFile - bad plugin', done => {
  fork(e => {
    expect(e.message).toEqual(
      'This plugin (zipzop) is not valid ({test: undefined, parse: undefined}).'
    )
    done()
  })(done)(
    configFile({
      ns: 'testtomlconf',
      transformer: [{ name: 'zipzop' }],
    })
  )
})

test('configFile - optional', done => {
  fork(done)(raw => {
    const { source } = raw
    expect(source).toEqual('No config found!')
    done()
  })(
    configFile({
      ns: 'zipzop',
      optional: true,
      json: true,
    })
  )
})

test('configFile - optional, barf', done => {
  fork(done)(raw => {
    const { source } = raw
    expect(source).toEqual('No config found!')
    done()
  })(
    configFile({
      ns: 'zipzop',
      optional: true,
      json: true,
    })
  )
})

test('configFile - optional, no barf', done => {
  fork(raw => {
    expect(raw.message).toEqual('No config file found!')
    done()
  })(done)(
    configFile({
      ns: 'zipzop',
      optional: false,
    })
  )
})
