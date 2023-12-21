const PKG = require('./package.json')
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

const INPUT = 'src/index.js'

const sd = (script, description = '') =>
  !!description ? { script, description } : { script }
module.exports = {
  scripts: {
    clean: sd('rm -r dist', 'clean the build'),
    build: sd(buildModule([INPUT, 'dist/' + PKG.main]), 'build it!'),

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
