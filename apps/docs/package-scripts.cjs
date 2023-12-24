const PREFERRED_PORT = '3001'
const PORT = process.env.PORT
const CHOSEN_PORT = !isNaN(parseInt(PORT)) ? PORT : PREFERRED_PORT
const PROD = process.env.NODE_ENV === 'production'
const CONFIG = require('./next.config.js')
const PANIC =
  'Something might be wrong. Unable to find a basePath in `next.config.js`.'
const PATH = CONFIG?.basePath ?? PANIC

module.exports = {
  scripts: {
    dev:
      PATH !== PANIC
        ? `echo "Visit sunny Documentation Island! 😎\n${
            PROD ? 'https://brekk.github.io' : `http://localhost:${CHOSEN_PORT}`
          }${PATH}" && next dev --port ${CHOSEN_PORT}`
        : `echo "${PANIC}"`,
    clean: {
      script: 'nps -c ./package-scripts.cjs clean.next clean.out',
      next: 'if [ -d .next ]; then rm -r .next; fi',
      out: 'if [ -d out ]; then rm -r out; fi',
    },
    build: 'next build',
    start: 'next start',
    lint: 'next lint --fix',
    autodoc: {
      script: 'nps -c ./package-scripts.cjs clean autodoc.regen',
      regen:
        'doctor-general -i ../../package.json -o pages -a dr-generated.json',
    },
  },
}
