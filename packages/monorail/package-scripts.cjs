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

const INPUT = `src/index.js`
const OUTPUT = PKG.main

const sd = (script, description = '') =>
  !!description ? { script, description } : { script }

module.exports = {
  scripts: {
    build: sd(build([INPUT, OUTPUT]), 'build an export!'),
    lint: sd('eslint --fix .', 'lint!'),
    test: {
      ...sd('jest --coverage', 'test!'),
      watch: sd('jest --watch --coverage', 'test with watch-mode!'),
    },
  },
}
