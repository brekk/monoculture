const plugin = {
  name: 'get-imports',
  dependencies: ['wordcount'],
  fn: (c, file, { selectAll, log }) => {
    const last = z => z[z.length - 1]
    const rawImports = selectAll(/^import/, /from (.*)$/g)
    // log('rawImports', rawImports)
    return rawImports
      .map(z => last(z).split(' '))
      .map(last)
      .map(z => z && z.slice(1, -1))
  },
}

export default plugin
