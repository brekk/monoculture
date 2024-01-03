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
      ].join(' ')} -o autotests --processor doctor-general-jest`,
      'generate tests with `doctor-general`!'
    ),
    lint: sd('eslint --fix .', 'lint!'),
    meta: {
      graph: `madge ${INPUT} --image graph.svg`,
    },
    test: {
      ...sd('jest --coverage --verbose', 'test!'),
      silent: sd(
        'jest --silent --reporters=jest-silent-reporter --coverageReporters=none',
        'test, quietly.'
      ),
      ci: sd(
        'jest --ci --json --coverage --testLocationInResults --outputFile=ci-report.json',
        'test for CI!'
      ),
      auto: sd('nps -c ./package-scripts.cjs autotest test', 'test!'),
      watch: sd('jest --watch', 'test with watch-mode!'),
    },
  },
}
