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
              'packages/bloodline',
              'packages/climate',
              'packages/climate-json',
              'packages/climate-toml',
              'packages/climate-yaml',
              'packages/clox',
              'packages/doctor-general',
              'packages/file-system',
              'packages/inherent',
              'packages/kiddo',
              'packages/knot',
              'packages/monocle',
              'packages/monorail',
              'packages/robot-tourist',
              'packages/water-wheel',
              'shared/eslint-config-monoculture',
              'shared/jest-config',
              'shared/monoculture-tsconfig',
              'tools/doctor-general-cli',
              'tools/digested',
              'tools/gitparty',
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
      ci: sd(
        `mkdir -p .coverage && turbo run test:ci && ${[
          'packages/bloodline/ci-report.json',
          'packages/climate/ci-report.json',
          'packages/climate-json/ci-report.json',
          'packages/climate-toml/ci-report.json',
          'packages/climate-yaml/ci-report.json',
          'packages/clox/ci-report.json',
          'packages/doctor-general/ci-report.json',
          'packages/file-system/ci-report.json',
          'packages/inherent/ci-report.json',
          'packages/kiddo/ci-report.json',
          'packages/knot/ci-report.json',
          'packages/monocle/ci-report.json',
          'packages/monorail/ci-report.json',
          'packages/robot-tourist/ci-report.json',
          'packages/water-wheel/ci-report.json',
          'shared/monoculture-tsconfig/ci-report.json',
          'tools/digested/ci-report.json',
          'tools/doctor-general-cli/ci-report.json',
          'tools/gitparty/ci-report.json',
          'tools/superorganism/ci-report.json',
          'tools/treacle/ci-report.json',
        ]
          .map(y => {
            const newname = y.slice(y.indexOf('/') + 1, y.lastIndexOf('/'))
            return 'cp ./' + y + ' .coverage/coverage-' + newname + '.json'
          })
          .join(' && ')} && nyc merge .coverage ci-report-full.json `,
        'test with turbo on CI'
      ),
      watch: sd('turbo run test:watch', 'test with turbo in watch mode'),
      snapshot: sd('turbo run test:snapshot', 'redo all the snapshots'),
    },
    deploy: sd('turbo run deploy', 'deploy and export builds'),
    prepare: sd('husky install', 'add git pre-commit hook'),
    workflow: {
      validate: sd(
        'action-validator .github/workflows/main.yml',
        'validate that the main github action works'
      ),
    },
    meta: {
      readme: sd(
        `yarn workspace digested run test:readme --silent > README.md`,
        // eslint-disable-next-line max-len
        // `echo '${SUMMARY}' > README.md && ./tools/spacework/summarize-workspaces.cjs --readme --show-deps >> README.md`,
        'regenerate the README!'
      ),
      docs: sd(
        `yarn workspace docs run autodoc build`,
        'generate a doctor-general-based JSON document'
      ),
      script: 'nps meta.graph',
      graph: sd(
        'turbo run meta:graph',
        'regenerate a graph of the source files'
      ),
    },
  },
}
