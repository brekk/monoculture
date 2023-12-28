const sd = (script, description = '') =>
  !!description ? { script, description } : { script }

const INPUT = 'climate.js'

module.exports = {
  scripts: {
    autotest: sd(
      `drgen -i ${['./builder.js', './help.js'].join(
        ' '
      )} -o autotests --test-mode`,
      'use doctor-general to create tests for us!'
    ),

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
