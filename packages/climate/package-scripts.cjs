const sd = (script, description = '') =>
  !!description ? { script, description } : { script }

const INPUT = 'index.js'

module.exports = {
  scripts: {
    lint: sd('eslint --fix .', 'lint!'),
    test: {
      ...sd('jest', 'test!'),
      watch: sd('jest --watch', 'test with watch-mode!'),
    },
    meta: {
      graph: `madge ${INPUT} --image graph.svg`,
    },
  },
}
