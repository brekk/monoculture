const { map, join, pipe } = require('ramda')
const PREFERRED_PORT = '3001'
const PORT = process.env.PORT
const CHOSEN_PORT = !isNaN(parseInt(PORT)) ? PORT : PREFERRED_PORT
const PROD = process.env.NODE_ENV === 'production'

// if we try to load this we run into nextra trying to access extra crap out of sync

// const CONFIG = require('./next.config.js')
// const PANIC =
// 'Something might be wrong. Unable to find a basePath in `next.config.js`.'
// const PATH = CONFIG?.basePath ?? PANIC

const PATH = '/docs'
const deleteDir = x => `if [ -d ${x} ]; then rm -r ${x}; fi`

module.exports = {
  scripts: {
    dev: `echo "Visit sunny Documentation Island! 😎\n${
      PROD ? 'https://brekk.github.io' : `http://localhost:${CHOSEN_PORT}`
    }${PATH}" && next dev --port ${CHOSEN_PORT}`,
    clean: {
      script: 'nps -c ./package-scripts.cjs clean.build',

      pages: pipe(
        map(z => './' + z),
        map(deleteDir),
        join(' && ')
      )(['bloodline', 'file-system', 'inherent', 'kiddo', 'monorail']),
      build: 'nps -c ./package-scripts.cjs clean.next clean.out',
      next: deleteDir('.next'),
      out: deleteDir('out'),
    },
    build: 'next build',
    start: 'next start',
    lint: 'next lint --fix',
    autodoc: {
      script: 'nps -c ./package-scripts.cjs clean.build autodoc.regen',
      // eslint-disable-next-line max-len
      regen: `doctor-general --monorepo --processor doctor-general-mdx -i ../../package.json -o pages -a dr-generated.json --ignore '**/coverage/**' --ignore '**/out/**' --ignore '**/fixture/**' --ignore '**/node_modules/**' --ignore '**/autotests/**' --ignore '**/*.spec.*'`,
    },
  },
}
