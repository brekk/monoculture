const PKG = require('./package.json')
const sd = (script, description = '') =>
  !!description ? { script, description } : { script }


const INPUT = `./file-system.js`
const OUTPUT = `dist/` + PKG.main
module.exports = {
  scripts: {
    clean: sd('rm -r dist', 'clean the build!'),
    lint: sd('eslint --fix .', 'lint!'),
    test: {
      ...sd('jest', 'test'),
      watch: sd('jest --watch', 'test with watch-mode!'),
    },
    meta: {
      graph: `madge ${INPUT} --image graph.svg`,
    },
  },
}
