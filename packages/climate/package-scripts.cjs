const sd = (script, description = '') =>
  !!description ? { script, description } : { script }

const INPUT = 'climate.js'

module.exports = {
  scripts: {
    autotest: {
      ...sd('nps -c ./package-scripts.cjs autotest.rebuild test'),
      rebuild: sd(
        `drgen -i ${['./builder.js', './help.js'].join(
          ' '
        )} -o autotests --interpreter doctor-general-jest`,
        'use doctor-general to create tests for us!'
      ),
    },
    lint: sd('eslint --fix .', 'lint!'),
    test: {
      ...sd('jest --coverage --verbose', 'test!'),
      snapshot: sd('jest -u', 'test with snapshottsssss'),
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
    meta: {
      graph: `madge ${INPUT} --image graph.svg`,
    },
  },
}
