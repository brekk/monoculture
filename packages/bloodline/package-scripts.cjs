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

const INPUT = './index.js'

const sd = (script, description = '') =>
  !!description ? { script, description } : { script }
module.exports = {
  scripts: {
    autogen: {
      ...sd(
        'nps -c ./package-scripts.cjs autogen.test',
        'automatically generate stuff'
      ),
      test: sd(
        `drgen -i ${[
          './api.js',
          './cli.js',
          './config.js',
          './constants.js',
          './cyclic.js',
          './executables.js',
          './failure.js',
          './tree.js',
          './visualization.js',
        ].join(' ')} -o autotests -a dr-generated-test.json`,
        'use doctor-general to create tests for us!'
      ),
    },
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
