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
const OUTPUT = PKG.main
module.exports = {
  scripts: {
    build: {
      ...sd(
        'nps -c ./package-scripts.cjs build.module build.bin build.pluginSimple build.plugin',
        'build all the shit'
      ),
      module: sd(buildModule([INPUT, OUTPUT]), 'build the module!'),
      bin: sd(build(['src/cli.js', 'wordbot.js']), 'build the executable!'),
      pluginSimple: sd(
        buildPlugin(['src/plugin-simple.js', 'plugin-simple.js']),
        'build the simple plugin!'
      ),
      plugin: sd(
        buildPlugin(['src/plugin-robot-tourist.js', 'plugin-robot-tourist.js']),
        'build the plugin!'
      ),
    },
    lint: sd('eslint --fix .', 'lint!'),
    test: {
      ...sd('jest', 'test'),
      watch: sd('jest --watch', 'test with watch-mode!'),
    },
    meta: {
      graph: `madge ${INPUT} --image graph.svg`,
    },
  },
}
