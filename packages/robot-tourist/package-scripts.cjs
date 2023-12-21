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
      ...sd(
        'nps -c ./package-scripts.cjs build.module build.bin build.plugins',
        'build all the shit'
      ),
      module: sd(buildModule([INPUT, OUTPUT]), 'build the module!'),
      bin: sd(
        build(['src/cli.js', 'dist/wordbot.js']),
        'build the executable!'
      ),
      plugins: {
        ...sd(
          // eslint-disable-next-line max-len
          'nps -c ./package-scripts.cjs build.plugins.simple build.plugins.main',
          'build all the plugins!'
        ),
        simple: sd(
          buildPlugin(['src/plugin-simplifier.js', 'monocle-plugin-simple.js']),
          'build the first plugin!'
        ),
        main: sd(
          buildPlugin([
            'src/plugin-robot-tourist.js',
            'monocle-plugin-main.js',
          ]),
          'build the main plugin!'
        ),
      },
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
