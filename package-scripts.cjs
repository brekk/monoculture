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
              'packages/doctor-general-mdx',
              'packages/doctor-general-jest',
              'packages/file-system',
              'packages/inherent',
              'packages/kiddo',
              'packages/knot',
              'packages/manacle',
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
    autotest: sd(
      'turbo run autotest',
      'build tests with drgen and then run them'
    ),
    lint: sd('turbo run lint', 'lint with turbo'),
    test: {
      ...sd('turbo run test', 'test with turbo'),
      silent: sd('turbo run test:silent', 'test with turbo, quietly'),
      ci: sd('turbo run test:ci', 'test for CI'),
      ciCopy: sd(
        [
          'if [ -d coverage ]; then rm -r coverage; fi; mkdir -p coverage',
          './tools/spacework/tps-reports.cjs > ./coverage/coverage-final.json',
          // eslint-disable-next-line max-len
          `npx nyc report -t coverage --report-dir coverage ${['json', 'lcov']
            .map(r => `--reporter=${r}`)
            .join(' ')}`,
        ].join(' && '),
        'automatically generate the merged jest config'
      ),
      ciReport: sd(
        `npx nyc report -t coverage --report-dir coverage --reporter=text --reporter=text-summary`,
        'Run CI report!'
      ),
      ciProjectSummary: sd(
        // eslint-disable-next-line max-len
        `nps -c ./package-scripts.cjs test.ciReport | ./tools/spacework/reporter-for-ci.cjs`,
        'Grab project summaries from the CI report'
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
