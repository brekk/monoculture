const sd = (script, description = '') =>
  !!description ? { script, description } : { script }

module.exports = {
  scripts: {
    meta: {
      graph: `madge ./doctor-general.js --image graph.svg`,
    },
    lint: sd('eslint --fix .', 'lint!'),
    test: {
      ...sd('jest', 'test!'),
      watch: sd('jest --watch', 'test with watch-mode!'),
    },
  },
}
