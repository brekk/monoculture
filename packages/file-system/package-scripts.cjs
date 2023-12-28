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
      ci: sd(
        'jest --ci --json --coverage --testLocationInResults --outputFile=ci-report.json',
        'test for CI!'
      ),
      watch: sd('jest --watch', 'test with watch-mode!'),
      snapshot: sd('jest -u', 'update snapshots'),
    },
    meta: {
      graph: `madge ${INPUT} --image graph.svg`,
    },
  },
}
