const { pipe, map, join } = require('ramda')
const { concurrent } = require('nps-utils')
const sd = (script, description = '') =>
  !!description ? { script, description } : { script }

const syncScripts = pkg =>
  `./tools/spacework/sync-scripts.cjs ${pkg}/package.json ${pkg}/package-scripts.cjs`

const sequence = join(' && ')

module.exports = {
  scripts: {
    readme: sd(
      'tree -I node_modules -I _next -I __snapshots__ -I coverage -d -L 3',
      'show the tree for the README'
    ),
    sync: {
      scripts: {
        ...sd(
          pipe(
            map(syncScripts),
            sequence
          )(
            // use :read !./tools/spacework/list-workspaces.cjs
            [
              '.',
              'apps/docs',
              'packages/configurate',
              'packages/file-system',
              'packages/monocle',
              'packages/monorail',
              'packages/robot-tourist',
              'shared/eslint-config-monoculture',
              'shared/jest-config',
              'shared/monoculture-tsconfig',
              'tools/monodoc',
              'tools/enscribe',
              'tools/superorganism',
              'tools/spacework',
            ]
          ),
          'sync scripts for all the files'
        ),
      },
    },
    care: sd('turbo run test', 'build and test with turbo'),
    build: sd('turbo run build', 'build with turbo'),
    lint: sd('turbo run lint', 'lint with turbo'),
    test: {
      ...sd('turbo run test', 'test with turbo'),
      watch: sd('turbo run test:watch', 'test with turbo in watch mode'),
    },
    deploy: sd('turbo run deploy', 'deploy and export builds'),
    prepare: sd('husky install', 'add git pre-commit hook'),
    meta: {
      docs: sd(
        `yarn workspace docs run autodoc build`,
        'generate a monodoc-based JSON document'
      ),
      script: 'nps meta.graph',
      graph: sd(
        'turbo run meta:graph',
        'regenerate a graph of the source files'
      ),
    },
  },
}
