const PKG = require('./package.json')
const sd = (script, description = '') =>
  !!description ? { script, description } : { script }
const build = ([infile, outfile]) =>
  [
    `esbuild`,
    `${infile}`,
    `--outfile=${outfile}`,
    `--bundle`,
    `--format=esm`,
    `--platform=node`,
    `--packages=external`,
  ].join(' ')

module.exports = {
  scripts: {
    build: build(['src/help.js', PKG.main]),
    lint: sd('eslint --fix .', 'lint!'),
    test: {
      ...sd('jest', 'test!'),
      watch: sd('jest --watch', 'test with watch-mode!'),
    },
  },
}
