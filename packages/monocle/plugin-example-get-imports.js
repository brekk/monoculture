const plugin = {
  name: 'get-imports',
  dependencies: ['wordcount'],
  fn: (c, file, { selectAll }) => {
    const last = z => z[z.length - 1]
    const rawImports = selectAll(/^import/, /from (.*)$/g)
    return rawImports
      .map(z => last(z).split(' '))
      .map(last)
      .map(z => z && z.slice(1, -1))
  },
}

export default plugin
