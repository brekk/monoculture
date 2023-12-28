const INPUT = 'inherent.js'

const sd = (script, description = '') =>
  !!description ? { script, description } : { script }
module.exports = {
  scripts: {
    autotest: sd(
      `drgen -i ${[
        './array.js',
        './common.js',
        './inherent.js',
        './object.js',
        './primitives.js',
      ].join(' ')} -o autotests --test-mode -a dr-generated.tests.json`,
      'generate tests with `doctor-general`!'
    ),
    lint: sd('eslint --fix .', 'lint!'),
    meta: {
      graph: `madge ${INPUT} --image graph.svg`,
    },
    test: {
      ...sd('jest', 'test!'),
      auto: sd('nps -c ./package-scripts.cjs autotest test', 'test!'),
      watch: sd('jest --watch', 'test with watch-mode!'),
    },
  },
}
