const plugin = {
  name: 'has-imports',
  dependencies: ['wordcount'],
  fn: (c, file, { any, onLine, onLines, selectAll, filter, between }) => {
    const lines = onLines(/import/g)
    const line = onLine(/node/g)
    const filtered = filter(/import/g)
    const imports = between(/^import/, /from (.*)$/g)
    const segmentedImports = selectAll(/^import/, /from (.*)$/g)
    // eslint-disable-next-line no-console
    console.log({ lines, line, filtered, imports, segmentedImports })
    return any(/import/g)
  },
}

export default plugin
