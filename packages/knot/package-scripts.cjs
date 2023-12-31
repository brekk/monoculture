const sd = (script, description = '') =>
  !!description ? { script, description } : { script }
module.exports = {
  scripts: {
    autotest: sd(
      `drgen -i ${['./knot.js'].join(
        ' '
      )} -o autotests --test-mode -a dr-generated.tests.json`,
      'use doctor-general to create tests for us!'
    ),
    clean: sd('rm -r dist', 'clean the build'),
    lint: sd('eslint --fix .', 'lint!'),
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
      integration: sd(
        'nps -c ./package-scripts.cjs autotest test.run',
        'autogenerate our tests and run all tests'
      ),
      watch: sd('jest --watch', 'test with watch-mode!'),
    },
  },
}
