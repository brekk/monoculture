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
    build: sd(
      'mkdir dist && ' + buildModule([INPUT, 'dist/knot.js']),
      'tie the knot!'
    ),
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
