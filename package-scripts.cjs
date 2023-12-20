const { pipe, map, join } = require('ramda')
const { concurrent } = require('nps-utils')
const sd = (script, description = '') =>
  !!description ? { script, description } : { script }

const syncScripts = pkg =>
  `./tools/spacework/sync-scripts.cjs ${pkg}/package.json ${pkg}/package-scripts.cjs`

const sequence = join(' && ')

const SUMMARY = `# monoculture

introspection and organization tools for monorepos

*Dependency legend*:

 - 🦴 package from within this monorepo
 - 🧪 package used as a devDependency

`

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
              'packages/bloodline',
              'packages/climate',
              'packages/climate-json',
              'packages/climate-toml',
              'packages/climate-yaml',
              'packages/clox',
              'packages/file-system',
              'packages/monocle',
              'packages/monorail',
              'packages/robot-tourist',
              'shared/eslint-config-monoculture',
              'shared/jest-config',
              'shared/monoculture-tsconfig',
              'tools/gitparty',
              'tools/monodoc',
              'tools/spacework',
              'tools/superorganism',
              'tools/treacle',
            ]
          ),
          'sync scripts for all the files'
        ),
      },
    },
    care: sd('turbo run lint test build', 'build and test with turbo'),
    build: sd('turbo run build', 'build with turbo'),
    lint: sd('turbo run lint', 'lint with turbo'),
    test: {
      ...sd('turbo run test', 'test with turbo'),
      watch: sd('turbo run test:watch', 'test with turbo in watch mode'),
    },
    deploy: sd('turbo run deploy', 'deploy and export builds'),
    prepare: sd('husky install', 'add git pre-commit hook'),
    meta: {
      readme: sd(
        // eslint-disable-next-line max-len
        `echo '${SUMMARY}' > README.md && ./tools/spacework/summarize-workspaces.cjs --readme --show-deps >> README.md`,
        'regenerate the README!'
      ),
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
