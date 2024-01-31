import { fork, parallel, resolve as resolveF } from 'fluture'
import { chain, map, pipe } from 'ramda'
import { readFile } from 'file-system'
import {
  monorepoRunner,
  readPackageJsonWorkspaces,
  iterateOverWorkspacesAndReadFiles,
} from './reader'

test('iterateOverWorkspacesAndReadFiles', done => {
  fork(done)(x => {
    expect(x).toEqual([
      'tools/digested',
      'tools/doctor-general-cli',
      'tools/gitparty',
      'tools/spacework',
      'tools/superorganism',
      'tools/treacle',
    ])
    done()
  })(
    iterateOverWorkspacesAndReadFiles(
      {
        searchGlob: '*',
        ignore: [],
      },
      '../..',
      resolveF(['tools/'])
    )
  )
})

test('readPackageJsonWorkspaces', done => {
  pipe(
    readFile,
    map(JSON.parse),
    readPackageJsonWorkspaces('../..'),
    chain(parallel(10)),
    fork(done)(x => {
      expect(x).toMatchSnapshot()

      done()
    })
  )('../../package.json')
})

test('monorepoRunner', done => {
  const cancel = () => {
    done()
  }
  const config = {
    color: true,
    ignore: [
      '**/node_modules/**',
      '**/coverage/**',
      '**/*.spec.{js,jsx,ts,tsx}',
      '**/fixture/**',
      '**/fixture.*',
    ],
    searchGlob: '**/*.{js,jsx,ts,tsx}',
    debug: false,
    verifyInterpreter: false,
    showMatchOnly: false,
  }
  fork(done)(x => {
    expect(x).toMatchSnapshot()
    done()
  })(monorepoRunner(cancel, config, '../..', '../../package.json'))
})
