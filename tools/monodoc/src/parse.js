import { basename, extname } from 'node:path'
import {
  defaultTo,
  join,
  curry,
  filter,
  flatten,
  head,
  identity,
  last,
  map,
  pathOr,
  pipe,
  propOr,
  uniq,
} from 'ramda'
import { readFile } from 'file-system'
import { addLineNumbers, groupContiguousBlocks } from './file'
import { lines, stripRelative } from './text'
import { isJSDocComment, objectifyComments } from './comment'

const getAny = curry((def, keyPath, comments) =>
  pipe(
    map(pathOr(def, keyPath)),
    filter(identity),
    uniq,
    x => x.sort(),
    head
  )(comments)
)

export const parse = curry((root, filename, content) => {
  const newName = stripRelative(filename)
  const newNameFolder = newName.slice(0, newName.lastIndexOf('/'))
  return pipe(
    // String
    lines,
    // List String
    raw =>
      pipe(
        addLineNumbers,
        // List #[Integer, String]
        filter(pipe(last, isJSDocComment)),
        // List #[Integer, String]
        groupContiguousBlocks,
        // List #[Integer, String]
        objectifyComments(newName, raw),
        // List CommentBlock
        comments => ({
          slugName: basename(newName, extname(newName)),
          pageSummary: pipe(
            getAny('', ['structure', 'pageSummary']),
            defaultTo([]),
            join(' ')
          )(comments),
          filename: newName,
          comments,
          order: pipe(getAny('0', ['structure', 'order']), x =>
            parseInt(x, 10)
          )(comments),
          fileGroup: getAny('', ['fileGroup'], comments),
          links: pipe(map(propOr([], 'links')), flatten)(comments),
        })
      )(raw)
    // CommentedFile
  )(content)
})

// comments in pipe show current shape per step
export const parseFile = curry((root, x) =>
  pipe(
    // String
    filename =>
      pipe(
        // String
        readFile,
        // Future<Error, String>
        map(parse(root, filename)),
        // remove orphan comments (parser found it but its not well-formed)
        map(p => ({
          ...p,
          comments: pipe(
            filter(
              ({ lines: l, start, end, summary }) =>
                start !== end && !!summary && l.length > 0
            )
          )(
            // && pipe(keys, length, lt(0))(structure)
            p.comments
          ),
        }))
      )(filename)
    // CommentedFile
  )(x)
)
