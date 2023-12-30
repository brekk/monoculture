const sd = (script, description = '') =>
  !!description ? { script, description } : { script }
module.exports = {
  scripts: {
    clean: sd('rm -r dist', 'clean the build'),
    lint: sd('eslint --fix .', 'lint!'),
    autotest: sd(
      `drgen -i ${['./water-wheel.js'].join(
        ' '
      )} -o autotests --test-mode -a dr-generated.tests.json`,
      'use doctor-general to create tests for us!'
    ),
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
      watch: sd('jest --watch', 'test with watch-mode!'),
    },
  },
}
