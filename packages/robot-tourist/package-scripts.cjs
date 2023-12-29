const PKG = require('./package.json')
const sd = (script, description = '') =>
  !!description ? { script, description } : { script }
const buildCLI = ([infile, outfile]) =>
  [
    `esbuild`,
    `${infile}`,
    `--outfile=${outfile}`,
    `--bundle`,
    `--format=cjs`,
    `--platform=node`,
    // `--packages=external`,
    `--banner:js="#!/usr/bin/env node"`,
  ].join(' ') +
  ' && chmod +x ' +
  outfile

const build = ([infile, outfile]) =>
  [
    `esbuild`,
    `${infile}`,
    `--outfile=${outfile}`,
    `--bundle`,
    `--format=cjs`,
    `--platform=node`,
    // `--packages=external`,
    // `--banner:js="#!/usr/bin/env node"`,
  ].join(' ')

const INPUT = `index.js`
module.exports = {
  scripts: {
    clean: sd('rm -r dist', 'clean out the build'),
    build: {
      ...sd('nps -c ./package-scripts.cjs build.bin', 'build all the shit'),
      bin: sd(
        [
          buildCLI(['cli.js', 'dist/wordbot.cjs']),
          build(['plugin-robot-tourist.js', 'dist/monocle-plugin-main.cjs']),
          build(['plugin-simplifier.js', 'dist/monocle-plugin-simple.cjs']),
        ].join(' && '),

        'build the executable!'
      ),
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
      snapshot: sd('jest -u', 'update snapshot'),
    },
    meta: {
      graph: `madge ${INPUT} --image graph.svg`,
    },
  },
}
