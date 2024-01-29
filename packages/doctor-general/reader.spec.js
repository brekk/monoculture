import { fork, parallel, resolve as resolveF } from 'fluture'
import { chain, map, pipe } from 'ramda'
import { readFile } from 'file-system'
import {
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
      /*
      [
        ['apps/docs/'],
        [
          'packages/bloodline/',
          'packages/climate-json/',
          'packages/climate-toml/',
          'packages/climate-yaml/',
          'packages/climate/',
          'packages/clox/',
          'packages/doctor-general-jest/',
          'packages/doctor-general-mdx/',
          'packages/doctor-general/',
          'packages/file-system/',
          'packages/inherent/',
          'packages/kiddo/',
          'packages/knot/',
          'packages/manacle/',
          'packages/monocle/',
          'packages/monorail/',
          'packages/robot-tourist/',
          'packages/water-wheel/',
        ],
        [
          'shared/eslint-config-monoculture/',
          'shared/jest-config/',
          'shared/monoculture-tsconfig/',
        ],
        [
          'tools/digested/',
          'tools/doctor-general-cli/',
          'tools/gitparty/',
          'tools/spacework/',
          'tools/superorganism/',
          'tools/treacle/',
        ],
      ]
      */
      done()
    })
  )('../../package.json')
})
