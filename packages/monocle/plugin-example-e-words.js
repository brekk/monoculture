const plugin = {
  name: 'e-words',
  dependencies: [],
  preserveLine: true,
  fn: (c, line) => line.split(' ').filter(z => z.startsWith('e')).length,
}

export default plugin
