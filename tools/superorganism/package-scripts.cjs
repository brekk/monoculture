const sd = (script, description = '') =>
  !!description ? { script, description } : { script }

/* eslint-disable max-len */
const build =
  ({ script = false, format }) =>
  ([infile, outfile]) =>
    [
      `esbuild`,
      `${infile}`,
      `--outfile=${outfile}`,
      `--bundle`,
      `--format=${format}`,
      `--platform=node`,
      `--packages=external`,
      script
        ? `--banner:js='#!/usr/bin/env node\nimport { createRequire as topLevelCreateRequire } from \"module\";\n const require = topLevelCreateRequire(import.meta.url);'`
        : ``,
    ]
      .filter(z => z)
      .join(' ')

// const esm = build({ format: 'esm' })
// const cjs = build({ script: true, format: 'cjs' })

const INPUT = `src/index.js`
const OUTPUT = `superorganism.mjs`
const CLI_INPUT = `src/cli.js`
const CLI_OUTPUT = `cli.mjs`

const watchMode = sd(
  `${build({ script: false, format: 'esm' })([INPUT, OUTPUT])} --watch`,
  'build with watch-mode'
)
module.exports = {
  scripts: {
    build: {
      ...sd(
        'nps -c ./package-scripts.cjs build.main build.cli',
        'build everything!'
      ),
      main: sd(
        build({ script: false, format: 'esm' })([INPUT, OUTPUT]),
        'build module!'
      ),
      cli: sd(
        build({ script: true, format: 'esm' })([CLI_INPUT, CLI_OUTPUT]),
        'build cli!'
      ),
      watch: watchMode,
    },
    dev: watchMode,
    meta: {
      graph: `madge ${CLI_INPUT} --image graph.svg`,
    },
    lint: sd('eslint --fix .', 'lint!'),
    test: {
      ...sd('jest', 'test!'),
      watch: sd('jest --watch', 'test with watch-mode!'),
    },
  },
}
