const sd = (script, description = '') =>
  !!description ? { script, description } : { script }
module.exports = {
  scripts: {
    autotest: sd(
      `drgen -i ${['./knot.js'].join(
        ' '
      )} -o autotests -a dr-generated-test.json --test-mode`,
      'use doctor-general to create tests for us!'
    ),
    clean: sd('rm -r dist', 'clean the build'),
    lint: sd('eslint --fix .', 'lint!'),
    test: {
      ...sd('jest', 'test!'),
      watch: sd('jest --watch', 'test with watch-mode!'),
    },
  },
}
