const sd = (script, description = '') =>
  !!description ? { script, description } : { script }

module.exports = {
  scripts: {
    // lint: sd('eslint --fix .', 'lint!'),
    test: {
      ...sd('jest', 'test!'),
      all: sd('jest', 'test!'),
      watch: sd('jest --watch', 'test with watch-mode!'),
    },
  },
}
