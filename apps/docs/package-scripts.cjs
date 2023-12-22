module.exports = {
  scripts: {
    dev: 'next dev --port 3001',
    clean: 'rm -r .next && rm -r out',
    build: 'next build',
    start: 'next start',
    lint: 'next lint --fix',
    deploy: 'next export -o ../../public/docs',
    autodoc:
      // eslint-disable-next-line max-len
      'doctor-general -i ../../package.json -o pages -a dr-generated.json ',
  },
}
