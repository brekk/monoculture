// eslint-disable-next-line import/extensions
// import { sd } from './superorganism.mjs'
const sd = (script, description) =>
  description ? { description, script } : script

/* eslint-disable max-len */
const build =
  ({ script = false, format }) =>
  ([infile, outfile]) =>
    [
      `esbuild`,
      `${infile}`,
      `--outfile=${outfile}`,
      `--bundle`,
      `--format=${format}`,
      `--platform=node`,
      script ? `--banner:js='#!/usr/bin/env node'` : ``,
    ]
      .filter(z => z)
      .join(' ')

const CLI_INPUT = `src/cli.js`
const CLI_OUTPUT = `dist/cli.cjs`

export default {
  scripts: {
    clean: sd('rm -r dist', 'unbuild!'),
    build: {
      ...sd('nps -c ./package-scripts.cjs build.cli', 'build everything!'),
      // main: sd(
      // build({ script: false, format: 'esm' })([INPUT, OUTPUT]),
      // 'build module!'
      // ),
      cli: sd(
        build({ script: true, format: 'cjs' })([CLI_INPUT, CLI_OUTPUT]),
        'build cli!'
      ),
    },
    meta: {
      graph: `madge ${CLI_INPUT} --image graph.svg`,
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
