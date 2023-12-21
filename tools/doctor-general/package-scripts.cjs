const sd = (script, description = '') =>
  !!description ? { script, description } : { script }

const pkg = require('./package.json')

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

const INPUT = `src/executable.js`
const OUTPUT_CLI = `dist/${pkg.name}.js`
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
      ...sd('jest', 'test!'),
      watch: sd('jest --watch', 'test with watch-mode!'),
    },
  },
}
