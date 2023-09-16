const sd = (script, description = '') =>
  !!description ? { script, description } : { script }

module.exports = {
  scripts: {
    lint: sd('eslint --fix .', 'lint!'),
  },
}
