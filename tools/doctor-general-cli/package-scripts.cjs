const sd = (script, description = '') =>
  !!description ? { script, description } : { script }

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

const buildModule = ([infile, outfile]) =>
  [
    `esbuild`,
    `${infile}`,
    `--outfile=${outfile}`,
    `--bundle`,
    `--format=esm`,
    `--platform=node`,
    `--packages=external`,
  ].join(' ')

const INPUT = `./executable.js`
const OUTPUT_CLI = './dist/doctor-general.cjs'
// const OUTPUT = `${pkg.name}.module.js`
const watchMode = sd(
  `${build([INPUT, OUTPUT_CLI])} --watch`,
  'build with watch-mode'
)
module.exports = {
  scripts: {
    clean: sd('rm -r dist', 'clean the stuff you built!'),
    build: {
      ...sd('nps -c ./package-scripts.cjs build.cli', 'build stuff!'),
      // module: sd(buildModule([INPUT, OUTPUT]), 'build esm modules!'),
      cli: sd(build([INPUT, OUTPUT_CLI]), 'build a cli tool!'),
      watch: watchMode,
    },
    dev: watchMode,
    meta: {
      graph: `madge ${INPUT} --image graph.svg`,
    },
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
    },
  },
}
