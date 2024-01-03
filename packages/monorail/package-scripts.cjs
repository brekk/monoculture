const PKG = require('./package.json')

const build = ([infile, outfile]) =>
  [
    `esbuild`,
    `${infile}`,
    `--outfile=${outfile}`,
    `--bundle`,
    `--format=esm`,
    `--platform=node`,
    `--packages=external`,
    `--banner:js="#!/usr/bin/env node"`,
  ].join(' ')

const sd = (script, description = '') =>
  !!description ? { script, description } : { script }

module.exports = {
  scripts: {
    autotest: sd(
      `drgen -i ${[
        './helpers.js',
        './list.js',
        './runner.js',
        './sort.js',
        './validate.js',
      ].join(' ')} -o autotests --processor doctor-general-jest`,
      'use doctor-general to create tests for us!'
    ),

    clean: sd('rm -r dist', 'clean the build'),

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
      watch: sd('jest --watch --coverage', 'test with watch-mode!'),
    },
    meta: {
      graph: `madge ./monorail.js --image graph.svg`,
    },
  },
}
