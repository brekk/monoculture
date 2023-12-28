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

const build = ([infile, outfile]) =>
  [
    `esbuild`,
    `${infile}`,
    `--outfile=${outfile}`,
    `--bundle`,
    `--format=cjs`,
    `--platform=node`,
    `--external:pnpapi`,
    // `--external:node:process`,
    // `--external:node:path`,
    // `--external:process`,
    // `--packages=external`,
    `--banner:js="#!/usr/bin/env node"`,
  ].join(' ') +
  ' && chmod +x ' +
  outfile

const INPUT = './index.js'

const sd = (script, description = '') =>
  !!description ? { script, description } : { script }

module.exports = {
  scripts: {
    build: sd(
      build(['./cli.js', './dist/bloodline.cjs']),
      'Build the CLI tool!'
    ),
    clean: sd('rm -r coverage', 'clean the build'),
    lint: sd('eslint --fix .', 'lint!'),
    meta: {
      graph: `madge ${INPUT} --image graph.svg`,
    },
    test: {
      ...sd('jest', 'test!'),
      watch: sd('jest --watch', 'test with watch-mode!'),
    },
  },
}
