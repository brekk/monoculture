// package-scripts.cjs generated by plopfile
const sd = (script, description = '') =>
  !!description ? { script, description } : { script }

const build = ([infile, outfile]) =>
  [
    `esbuild`,
    `${infile}`,
    `--outfile=${outfile}`,
    `--bundle`,
    `--format=cjs`,
    `--platform=node`,
    // `--packages=external`,
    `--banner:js="#!/usr/bin/env node"`,
  ].join(' ') + ` && chmod +x ${outfile}`

const INPUT = `executable.js`
const OUTPUT = `dist/digested.cjs`
const watchMode = sd(
  `${build([INPUT, OUTPUT])} --watch`,
  'build with watch-mode'
)
module.exports = {
  scripts: {
    clean: sd('rm -r dist', 'unbuild!'),
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
      // eslint-disable-next-line max-len
      integration: `./dist/digested.cjs -m -u 'https://brekk.github.io/monoculture' -d ../../apps/docs/dr-generated.json -r 'https://github.com/brekk/monoculture/tree/main' -i ../../package.json`,
    },
  },
}
