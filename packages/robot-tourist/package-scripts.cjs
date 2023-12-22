const PKG = require('./package.json')
const sd = (script, description = '') =>
  !!description ? { script, description } : { script }
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

const buildPlugin = ([infile, outfile]) =>
  [
    `esbuild`,
    `${infile}`,
    `--outfile=${outfile}`,
    `--bundle`,
    `--format=esm`,
    `--packages=external`,
    `--platform=node`,
  ].join(' ')

const INPUT = `src/index.js`
const OUTPUT = `dist/${PKG.main}`
module.exports = {
  scripts: {
    clean: sd('rm -r dist', 'clean out the build'),
    build: {
      ...sd('nps -c ./package-scripts.cjs build.bin', 'build all the shit'),
      bin: sd(build(['cli.js', 'dist/wordbot.js']), 'build the executable!'),
    },
    lint: sd('eslint --fix .', 'lint!'),
    test: {
      ...sd('jest', 'test'),
      watch: sd('jest --watch', 'test with watch-mode!'),
      snapshot: sd('jest -u', 'update snapshot'),
    },
    meta: {
      graph: `madge ${INPUT} --image graph.svg`,
    },
  },
}
