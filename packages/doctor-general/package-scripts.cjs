const sd = (script, description = '') =>
  !!description ? { script, description } : { script }

module.exports = {
  scripts: {
    meta: {
      graph: `madge ./doctor-general.js --image graph.svg`,
    },
    lint: sd('eslint --fix .', 'lint!'),
    autotest: sd(
      `drgen -i ${[
        'comment-documentation.js',
        'comment-test.js',
        'comment.js',
        'constants.js',
        'doctor-general.js',
        'drgen.js',
        'file.js',
        'log.js',
        'next-meta-files.js',
        'parse.js',
        'reader.js',
        'renderer-jest.js',
        'renderer-markdown.js',
        'stats.js',
        'text.js',
        'writer.js',
      ].join(' ')} -o autotests --test-mode -a dr-generated.tests.json`,
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
