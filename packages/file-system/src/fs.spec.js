import path from 'node:path'
import { cwd } from 'node:process'
import { fork } from 'fluture'
import { split, of, ap, init, last, pipe } from 'ramda'
import U from 'unusual'
import {
  localize,
  DEFAULT_REMOVAL_CONFIG,
  removeFilesWithConfig,
  mkdirp,
  readFile,
  readDirWithConfig,
  rimraf,
  writeFile,
  writeFileWithAutoPath,
} from './fs'
import { localsOnly } from './test-helpers'
import PKG from '../package.json'

const u = U(PKG.name + '@' + PKG.version)
test('localize', () => {
  expect(localize('rawr')).toEqual('./rawr')
})

test('writeFile', done => {
  const input = `` + u.integer({ min: 0, max: 1e6 })
  fork(done)(z => {
    expect(z).toEqual(input)
    done()
  })(
    writeFile(
      path.resolve(cwd(), 'fixture/apps/admin-pretend/fakefile.biz'),
      input
    )
  )
})

test('writeFile - fail', done => {
  fork(z => {
    expect(z).toBeTruthy()
    expect(z.toString().includes('ENOENT')).toBeTruthy()
    done()
  })(done)(
    writeFile(
      path.resolve(cwd(), 'invalid-path/apps/admin-pretend/fakefile.biz'),
      'fixture'
    )
  )
})

test('writeFile - fail differently', done => {
  fork(z => {
    expect(z).toBeTruthy()
    expect(z.toString().includes('EBADF')).toBeTruthy()
    done()
  })(done)(writeFile(100, 'fixture'))
})

test('readDirWithConfig', done => {
  fork(done)(x => {
    expect(x.sort()).toEqual([
      'fixture/apps',
      'fixture/apps/admin-pretend',
      'fixture/apps/admin-pretend/fakefile.biz',
      'fixture/apps/docs-pretend',
      'fixture/apps/docs-pretend/fakefile.biz',
      'fixture/packages',
      'fixture/packages/eslint-pretend',
      'fixture/packages/eslint-pretend/fakefile.biz',
      'fixture/packages/ui-pretend',
      'fixture/packages/ui-pretend/fakefile.biz',
      'fixture/raw.js',
      'fixture/scripts',
      'fixture/scripts/cool-script',
      'fixture/scripts/cool-script/fakefile.biz',
      'fixture/scripts/copy-to-pretend',
      'fixture/scripts/copy-to-pretend/fakefile.biz',
    ])
    done()
  })(readDirWithConfig({}, 'fixture/**/*'))
})

test('readDirWithConfig - failure', done => {
  fork(done)(x => {
    expect(x).toEqual([])
    done()
  })(readDirWithConfig({}, '../fixture-untouchable/**'))
})

test('readDirWithConfig src/*/', done => {
  fork(done)(x => {
    expect(x.sort()).toEqual([
      'fixture/apps/',
      'fixture/packages/',
      'fixture/scripts/',
    ])
    done()
  })(readDirWithConfig({}, 'fixture/*/'))
})

test('readDir - fail', done => {
  fork(x => {
    expect(x.message).toEqual(`callback provided to sync glob`)
    done()
  })(done)(readDirWithConfig({ sync: true }, '@@#()@#()@'))
})

test('readFile', done => {
  fork(done)(z => {
    expect(z).toMatchInlineSnapshot(`
"{
  "name": "file-system",
  "version": "0.0.1",
  "description": "fs + futures",
  "main": "file-system.js",
  "type": "module",
  "repository": "brekk/monoculture",
  "author": "brekk",
  "license": "ISC",
  "private": true,
  "dependencies": {
    "execa": "^8.0.1",
    "fluture": "^14.0.0",
    "ramda": "^0.29.1"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.1.4",
    "dotenv-cli": "^7.3.0",
    "eslint-config-monoculture": "workspace:shared/eslint-config-monoculture",
    "jest": "^29.7.0"
  },
  "scripts": {
    "nps": "dotenv -- nps -c ./package-scripts.cjs",
    "build": "dotenv -- nps -c ./package-scripts.cjs build",
    "lint": "dotenv -- nps -c ./package-scripts.cjs lint",
    "meta": "dotenv -- nps -c ./package-scripts.cjs meta",
    "meta:graph": "dotenv -- nps -c ./package-scripts.cjs meta.graph",
    "test": "dotenv -- nps -c ./package-scripts.cjs test",
    "test:watch": "dotenv -- nps -c ./package-scripts.cjs test.watch"
  }
}
"
`)
    done()
  })(readFile(path.resolve(cwd(), 'package.json')))
})

test.skip('readFile - fail', done => {
  fork(z => {
    pipe(split(' '), of, ap([init, last]), ([a, b]) => {
      expect(a.join(' ')).toEqual('ENOENT: no such file or directory, open')
      expect(localsOnly(b.slice(1, -1))).toEqual(
        'packages/file-system/coolfilenice.biz'
      )
    })(z.message)
    done()
  })(done)(readFile(path.resolve(cwd(), 'coolfilenice.biz')))
})

test('mkdirp', done => {
  fork(done)(raw => {
    expect(raw).toBeTruthy()
    done()
  })(mkdirp('my-dir'))
})

test('writeFileWithAutoPath', done => {
  const FILE_PATH = './my-dir/is/a/big/long/list/of/directories/file.biz'
  fork(done)(raw => {
    expect(raw).toBeTruthy()
    fork(done)(() => done())(
      removeFilesWithConfig(DEFAULT_REMOVAL_CONFIG, [FILE_PATH])
    )
  })(writeFileWithAutoPath(FILE_PATH, 'cool cool content'))
})

test('readFile', done => {
  fork(done)(x => {
    expect(x).toEqual(`const raw = {
  input: 'this is a fixture',
}

export default raw
`)
    done()
  })(readFile(__dirname + '/../fixture/raw.js'))
})

afterAll(done => {
  fork(done)(() => done())(rimraf('my-dir'))
})
