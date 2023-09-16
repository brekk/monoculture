module.exports = {
  scripts: {
    dev: 'next dev --port 3001',
    build: 'next build',
    start: 'next start',
    lint: 'next lint --fix',
    deploy: 'next export -o ../../public/docs',
    autodoc:
      // eslint-disable-next-line max-len
      'daffy-doc -i ../../package.json -o pages/automated -a daffy-doc-generated.json',
  },
}
