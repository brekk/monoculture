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

const INPUT = `src/index.js`
const OUTPUT = PKG.main
module.exports = {
  scripts: {
    build: {
      ...sd(
        'nps -c ./package-scripts.cjs build.module build.bin build.plugin',
        'build all the shit'
      ),
      module: sd(buildModule([INPUT, OUTPUT]), 'build the module!'),
      bin: sd(build(['src/cli.js', 'wordbot.js']), 'build the executable!'),
      plugin: sd(build(['src/plugin.js', 'plugin-reader.js']), 'build the plugin!'),
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
