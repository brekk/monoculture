const sd = (script, description = '') =>
  !!description ? { script, description } : { script }

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

const INPUT = './index.js'
const OUTPUT = './dist/doctor-general-mdx.cjs'
module.exports = {
  scripts: {
    build: `mkdir -p dist && ${build([INPUT, OUTPUT])} && chmod +x ${OUTPUT}`,
    meta: {
      graph: `madge ./doctor-general-mdx.js --image graph.svg`,
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
