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
} from 'ramda'
import { log } from './log'
import { stripRelative } from './text'
import { combineFiles } from './file'

export const parsePackageName = y => {
  const slash = y.indexOf('/')
  const start = slash + 1
  const end = y.indexOf('/', start)
  return y.slice(start, end)
}

export const filterAndStructureComments = pipe(
  log.doc('filter and structure!'),
  filter(pipe(propOr([], 'comments'), isNotEmpty)),
  map(raw => {
    log.doc('file', raw)
    const filename = stripRelative(raw.filename)
    return {
      ...raw,
      comments: raw.comments.map(r => ({ ...r, filename })),
      filename,
      workspace: parsePackageName(filename),
    }
  }),
  reduce((agg, file) => {
    const filenames = map(prop('filename'), agg)
    const alreadyInList = filenames.includes(file.filename)
    const anyFile = file.comments.filter(({ structure }) => structure.asFile)
    const someFile = anyFile.length > 0 ? anyFile[0] : false
    const asFilePath = pipe(
      defaultTo({}),
      pathOr('???', ['structure', 'asFile'])
    )(someFile)
    const withOrder = pipe(pathOr('0', ['structure', 'order']), x =>
      parseInt(x, 10)
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
)
