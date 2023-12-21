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
    // `--platform=node`,
    `--packages=external`,
  ].join(' ')

const INPUT = 'src/index.js'

module.exports = {
  scripts: {
    clean: sd('rm -r dist', 'clean the build'),
    build: sd(build([INPUT, 'dist/climate.js']), 'build it'),
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
