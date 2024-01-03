import { extname, basename, dirname, join as pathJoin } from 'node:path'
import { isNotEmpty } from 'inherent'
import { TESTABLE_EXAMPLE } from './constants'
import {
  defaultTo,
  filter,
  includes,
  map,
  pathOr,
  pipe,
  prop,
  propOr,
  reduce,
} from 'ramda'
import { stripRelative } from './text'
import { combineFiles } from './file'
export const hasExample = pipe(
  pathOr('', ['structure', 'example']),
  includes(TESTABLE_EXAMPLE)
)

export const filterAndStructureTests = pipe(
  filter(pipe(propOr([], 'comments'), filter(hasExample), isNotEmpty)),
  map(raw => {
    const filename = stripRelative(raw.filename)
    const ext = extname(filename)
    return {
      ...raw,
      comments: raw.comments.map(r => ({ ...r, filename })),
      filename,
      testPath: `${basename(filename, ext)}.spec${ext}`,
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
