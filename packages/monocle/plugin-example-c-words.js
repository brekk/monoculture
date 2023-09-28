const plugin = {
  name: 'c-words',
  dependencies: [],
  preserveLine: true,
  fn: (c, line) => line.split(' ').filter(z => z.startsWith('c')).length,
}

export default plugin
