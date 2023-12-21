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

const INPUT = `src/cli.js`
const OUTPUT = `dist/${PKG.main}`

const sd = (script, description = '') =>
  !!description ? { script, description } : { script }

module.exports = {
  scripts: {
    clean: sd('rm -r dist', 'clean the build'),
    build: sd('mkdir dist && ' + build([INPUT, OUTPUT]), 'build an export!'),
    lint: sd('eslint --fix .', 'lint!'),
    test: {
      ...sd('jest', 'test!'),
      watch: sd('jest --watch', 'test with watch-mode!'),
    },
    meta: {
      graph: `madge ${INPUT} --image graph.svg`,
    },
  },
}
