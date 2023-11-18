import { sd } from './superorganism.mjs'

const build = ([infile, outfile], addendum = '') =>
  [
    `esbuild`,
    `${infile}`,
    `--outfile=${outfile}`,
    `--bundle`,
    `--format=esm`,
    `--platform=node`,
    `--packages=external`,
    `--banner:js="#!/usr/bin/env node"`,
    ...addendum,
  ]
    .filter(z => z)
    .join(' ')

const INPUT = `src/index.js`
const OUTPUT = `superorganism.js`
const watchMode = sd(
  build([INPUT, OUTPUT], ['--watch']),
  'build with watch-mode'
)
export default {
  scripts: {
    build: {
      ...sd(build([INPUT, OUTPUT]), 'build!'),
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
