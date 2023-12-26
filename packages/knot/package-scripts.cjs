const sd = (script, description = '') =>
  !!description ? { script, description } : { script }
module.exports = {
  scripts: {
    autogen: {
      ...sd(
        'nps -c ./package-scripts.cjs autogen.tests',
        'automatically regenerate stuff!'
      ),
      tests: sd(
        `drgen -i ./package.json -o .`,
        'automatically generate tests!'
      ),
    },
    clean: sd('rm -r dist', 'clean the build'),
    lint: sd('eslint --fix .', 'lint!'),
    test: {
      ...sd('jest', 'test!'),
      watch: sd('jest --watch', 'test with watch-mode!'),
    },
  },
}
