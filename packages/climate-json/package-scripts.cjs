const sd = (script, description = '') =>
  !!description ? { script, description } : { script }

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

module.exports = {
  scripts: {
    clean: sd('rm -r dist', 'clean the build'),
    build: sd(
      'mkdir dist && ' + build(['src/index.js', 'dist/' + PKG.main]),
      'build this climate plugin, please!'
    ),
    lint: sd('eslint --fix .', 'lint!'),
    test: {
      ...sd('jest', 'test!'),
      watch: sd('jest --watch', 'test with watch-mode!'),
    },
  },
}
