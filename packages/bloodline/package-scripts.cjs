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

const build = ([infile, outfile]) =>
  [
    `esbuild`,
    `${infile}`,
    `--outfile=${outfile}`,
    `--bundle`,
    `--format=cjs`,
    `--platform=node`,
    `--external:pnpapi`,
    // `--external:node:process`,
    // `--external:node:path`,
    // `--external:process`,
    // `--packages=external`,
    `--banner:js="#!/usr/bin/env node"`,
  ].join(' ') +
  ' && chmod +x ' +
  outfile

const INPUT = './cli.js'

const sd = (script, description = '') =>
  !!description ? { script, description } : { script }

module.exports = {
  scripts: {
    build: sd(
      build(['./cli.js', './dist/bloodline.cjs']),
      'Build the CLI tool!'
    ),
    clean: sd('rm -r coverage', 'clean the build'),
    lint: sd('eslint --fix .', 'lint!'),
    meta: {
      graph: `nps -c ./package-scripts.cjs build test.integration`,
      madge: `madge ${INPUT} --include-npm --image graph-madge.svg`,
    },
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
        `./dist/bloodline.cjs -i ./cli.js -o graph.svg`,
        'use bloodline to generate a graph of bloodline!'
      ),
    },
  },
}
