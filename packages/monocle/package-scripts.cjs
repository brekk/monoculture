const PKG = require('./package.json')

const build = ([infile, outfile]) =>
  [
    `esbuild`,
    `${infile}`,
    `--outfile=${outfile}`,
    `--bundle`,
    `--format=cjs`,
    `--platform=node`,
    // `--packages=external`,
    `--banner:js="#!/usr/bin/env node"`,
  ].join(' ')

const INPUT = `./cli.js`
const OUTPUT = './dist/cli.cjs'

const sd = (script, description = '') =>
  !!description ? { script, description } : { script }

module.exports = {
  scripts: {
    clean: sd('rm -r dist', 'clean the build'),
    build: sd(
      build([INPUT, OUTPUT]) + ' && chmod +x ' + OUTPUT,
      'build an export!'
    ),
    lint: sd('eslint --fix .', 'lint!'),
    test: {
      ...sd('jest --coverage --verbose', 'test!'),
      silent: sd(
        'jest --silent --reporters=jest-silent-reporter --coverageReporters=none',
        'test, quietly.'
      ),
      ci: sd(
        'jest --ci --json --coverage --testLocationInResults --outputFile=ci-report.json',
        'test for CI!'
      ),
      watch: sd('jest --watch', 'test with watch-mode!'),
      integration: sd(
        // eslint-disable-next-line max-len
        `./dist/cli.cjs -c ./examples/rulefile-test-run.toml "./*" -i "./**/*.spec.*" -i "./**/ci-report.json"`,
        'run an example rulefile!'
      ),
    },
    meta: {
      graph: `madge ${INPUT} --image graph.svg`,
    },
  },
}
