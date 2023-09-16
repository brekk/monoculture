import path from 'node:path'
import { cwd } from 'node:process'
import { fork } from 'fluture'
import { split, of, ap, init, last, pipe } from 'ramda'
import U from 'unusual'
import {
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
      'fixture/scripts',
      'fixture/scripts/cool-script',
      'fixture/scripts/cool-script/fakefile.biz',
      'fixture/scripts/copy-to-pretend',
      'fixture/scripts/copy-to-pretend/fakefile.biz',
    ])
    done()
  })(readDirWithConfig({}, 'fixture/**/*'))
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
    expect(z).toMatchInlineSnapshot(``)
    done()
  })(readFile(path.resolve(cwd(), 'package.json')))
})

test('readFile - fail', done => {
  fork(z => {
    pipe(split(' '), of, ap([init, last]), ([a, b]) => {
      expect(a.join(' ')).toEqual('ENOENT: no such file or directory, open')
      expect(localsOnly(b.slice(1, -1))).toEqual(
        'packages/fl-utils/coolfilenice.biz'
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

afterAll(done => {
  fork(done)(() => done())(rimraf('my-dir'))
})
