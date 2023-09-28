import { pipe, map, trim, reduce } from 'ramda'

const plugin = {
  name: 'wordcount',
  dependencies: [],
  fn: (c, f) =>
    pipe(
      map(([, lineContent]) => lineContent.split(' ').map(trim).length),
      reduce((a, b) => a + b, 0)
    )(f.body),
}

export default plugin
