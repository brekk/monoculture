const { pipe, map, join } = require('ramda')
const { concurrent } = require('nps-utils')
const sd = (script, description = '') =>
  !!description ? { script, description } : { script }

const syncScripts = pkg =>
  `scripts/sync-scripts.cjs ${pkg}/package.json ${pkg}/package-scripts.cjs`

const rebuildScript = where =>
  sequence([
    `cd ./scripts/${where}`,
    `yarn build`,
    `cd ../..`,
    `pwd`,
    `chmod +x ./scripts/${where}/${where}.js`,
    `echo "Rebuilt: scripts/${where}/${where}.js"`,
  ])

const sequence = join(' && ')

module.exports = {
  scripts: {
    readme: sd(
      'tree -I node_modules -I _next -I __snapshots__ -d -L 3',
      'show the tree for the README'
    ),
    copy: {
      ...sd(
        `./scripts/copy2workspace/copy2workspace.js ./package.json`,
        'copy a file from one package to all other packages'
      ),
      rebuild: sd(rebuildScript('copy2workspace'), `build the script`),
    },
    proxy: sd(
      concurrent({
        cases: 'yarn workspace cases run dev',
        server: 'node proxyServer.js',
      }),
      'run the proxy server!'
    ),
    syncScripts: {
      ...sd(
        pipe(
          map(syncScripts),
          sequence
        )(
          // use :read !node scripts/list-all-workspaces.cjs

          [
            'apps/cases',
            'apps/docs',
            'apps/ui-admin',
            'apps/ui-entity-admin',
            'packages/data-hooks',
            'packages/eslint-config-custom',
            'packages/fake-data',
            'packages/fl-utils',
            'packages/jest-config',
            'packages/simulacra',
            'packages/tsconfig',
            'packages/ui-scaffold',
            'scripts/copy2workspace',
            'scripts/simulacra-cli',
            'scripts/typewriter',
            '.',
          ]
        ),
        'sync scripts for all the files'
      ),
    },
    build: sd('turbo run build', 'build with turbo'),
    dev: sd('turbo run dev --parallel', 'build for dev'),
    lint: sd('turbo run lint', 'lint with turbo'),
    test: {
      ...sd('turbo run test', 'test with turbo'),
      all: sd('turbo run test:all', 'test with turbo'),
      watch: sd('turbo run test:watch', 'test with turbo in watch mode'),
    },
    deploy: sd(
      'turbo run deploy --filter=!./apps/ui-*',
      'deploy and export builds'
    ),
    prepare: sd('husky install', 'add git pre-commit hook'),
    meta: {
      docs: sd(
        `scripts/daffy-doc/daffy-doc-cli.js -i package.json -a factory-docs.json -o autodoc`,
        'generate a daffy-doc-based JSON document'
      ),
      script: 'nps meta.graph',
      graph: sd(
        'turbo run meta:graph',
        'regenerate a graph of the source files'
      ),
    },
  },
}
