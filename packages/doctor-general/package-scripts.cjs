const sd = (script, description = '') =>
  !!description ? { script, description } : { script }

module.exports = {
  scripts: {
    autotest: {
      ...sd(
        'nps -c ./package-scripts.cjs autotest.rebuild test',
        'rebuild and test autotests'
      ),
      rebuild: sd(
        `drgen -i ${[
          './processor.js',
          './reader.js',
          './text.js',
          './file.js',
          './comment.js',
        ].join(' ')} -o autotests --processor doctor-general-jest`,
        'generate tests with `doctor-general`!'
      ),
    },

    meta: {
      graph: `madge ./doctor-general.js --image graph.svg`,
    },
    lint: sd('eslint --fix .', 'lint!'),
    test: {
      ...sd('jest --coverage --verbose', 'test!'),
      snapshot: sd('jest -u', 'update snerpsherts'),

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
