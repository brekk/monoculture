import { last, nth, split } from 'ramda'
const words = split(' ')
const BASE = { exports: [], reExports: [] }
const plugin = {
  name: 'get-exports',
  dependencies: ['has-exports'],
  selector: y => y?.state?.['has-exports'],
  fn: (context, file, { filter }) =>
    context?.[file.name]
      ? filter(/^export/g).reduce((agg, [_line, content]) => {
          const parts = words(content)
          const [, declaration, x] = parts
          if (declaration !== '*' || x !== 'from') {
            return { ...agg, exports: [...agg.exports, x] }
          } else if (declaration === '*' || nth(-2, parts) === 'from') {
            return { ...agg, reExports: [...agg.reExports, last(parts)] }
          }
          return agg
        }, BASE)
      : BASE,
}

export default plugin
