import { dirname, join as pathJoin } from 'node:path'
import { isNotEmpty } from 'inherent'
import {
  defaultTo,
  filter,
  map,
  pathOr,
  pipe,
  prop,
  propOr,
  reduce,
  path,
  head,
  replace,
  curry,
} from 'ramda'

// TODO: consolidate this
export const combineFiles = curry(function _combineFiles(leftToRight, a, b) {
  return !leftToRight
    ? combineFiles(true, b, a)
    : {
        ...a,
        ...b,
        comments: [...a.comments, ...b.comments],
        links: [...a.links, ...b.links],
      }
})

export const pullPageTitleFromAnyComment = pipe(
  filter(pathOr(false, ['structure', 'page'])),
  map(path(['structure', 'page'])),
  head,
  defaultTo(''),
  replace(/\s/g, '-'),
  defaultTo(false)
)

export const parsePackageName = y => {
  const slash = y.indexOf('/')
  const start = slash + 1
  const end = y.indexOf('/', start)
  return slash > -1 ? y.slice(start, end) : y
}

export const slug = name => {
  const slashPlus = name.lastIndexOf('/') + 1
  return name.indexOf('.') > -1
    ? name.slice(slashPlus, name.indexOf('.'))
    : name.slice(slashPlus)
}
// TODO: we should consolidate this eventually
export const stripRelative = replace(/\.\.\/|\.\//g, '')

export function filterAndStructureComments(x) {
  return pipe(
    filter(pipe(propOr([], 'comments'), isNotEmpty)),
    map(function addBaseToComment(raw) {
      const filename = stripRelative(raw.filename)
      return {
        ...raw,
        comments: raw.comments.map(r => ({
          ...r,
          filename,
          package: raw.package,
        })),
        filename,
        workspace: raw.package,
      }
    }),
    reduce(function walkComments(agg, file) {
      const filenames = map(prop('filename'), agg)
      const alreadyInList = filenames.includes(file.filename)
      const anyFile = file.comments.filter(({ structure }) => structure.asFile)
      const someFile = anyFile.length > 0 ? anyFile[0] : false
      const asFilePath = pipe(
        defaultTo({}),
        pathOr('???', ['structure', 'asFile'])
      )(someFile)
      const withOrder = pipe(pathOr('0', ['structure', 'order']), y =>
        parseInt(y, 10)
      )(someFile)
      const dir = dirname(file.filename)
      const newFile = someFile ? pathJoin(dir, asFilePath) : '???'
      return alreadyInList
        ? map(raw => {
            const check = raw.filename === file.filename
            return check ? combineFiles(raw.order < withOrder, raw, file) : raw
          })(agg)
        : [
            ...agg,
            someFile
              ? {
                  ...file,
                  filename: newFile,
                  order: withOrder,
                  originalFilename: file.filename,
                }
              : file,
          ]
    }, [])
  )(x)
}
