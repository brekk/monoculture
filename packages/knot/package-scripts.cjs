const sd = (script, description = '') =>
  !!description ? { script, description } : { script }
module.exports = {
  scripts: {
    autotest: sd(
      `drgen -i ${['./knot.js'].join(' ')} -o autotests --test-mode`,
      'use doctor-general to create tests for us!'
    ),
    clean: sd('rm -r dist', 'clean the build'),
    lint: sd('eslint --fix .', 'lint!'),
    test: {
      ...sd(
        'nps -c ./package-scripts.cjs autotest test.run',
        'autogenerate our tests and run all tests'
      ),
      run: sd('jest', 'test!'),
      watch: sd('jest --watch', 'test with watch-mode!'),
    },
  },
}
