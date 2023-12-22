module.exports = {
  scripts: {
    dev: 'next dev --port 3001',
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
