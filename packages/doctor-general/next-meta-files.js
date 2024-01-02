import { join as pathJoin, basename } from 'node:path'
import {
  curry,
  map,
  pipe,
  toLower,
  filter,
  applySpec,
  head,
  always as K,
  prop,
  groupBy,
  last,
  propOr,
  sortBy,
  fromPairs,
  toPairs,
  pathOr,
} from 'ramda'
import { writeFileWithAutoPath } from 'file-system'
import { cleanFilename } from './file'
import { capitalToKebab, stripLeadingHyphen } from './text'

export const prepareMetaFiles = curry(
  function _prepareMetaFiles(testMode, outputDir, workspace, commentedFiles) {
    pipe(
      map(raw => [
        pipe(cleanFilename(testMode), x => basename(x, '.mdx'), toLower)(raw),
        pipe(
          propOr([], 'comments'),
          filter(pathOr(false, ['structure', 'name'])),
          head,
          applySpec({
            order: pipe(pathOr('0', ['structure', 'order']), x =>
              parseInt(x, 10)
            ),
            group: pathOr('', ['structure', 'group']),
            name: pipe(pathOr('???', ['structure', 'name'])),
            metaName: K(prop('slugName', raw)),
          })
        )(raw),
      ]),
      groupBy(pipe(last, propOr('', 'group'))),
      map(
        pipe(
          sortBy(pathOr(0, ['order'])),
          map(([title, { metaName }]) => [
            pipe(capitalToKebab, stripLeadingHyphen, toLower)(title),
            metaName,
          ]),
          fromPairs
        )
      ),
      toPairs,
      map(([folder, data]) =>
        writeFileWithAutoPath(
          pathJoin(outputDir, workspace, toLower(folder), '_meta.json'),
          JSON.stringify(data, null, 2)
        )
      )
    )(commentedFiles)
  }
)
