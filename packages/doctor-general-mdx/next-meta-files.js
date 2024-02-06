import { join as pathJoin, basename } from 'node:path'
import {
  when,
  prepend,
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
import { slugWord } from 'knot'
import { writeFileWithAutoPath } from 'file-system'

export const prepareMetaFiles = curry(
  function _prepareMetaFiles(outputDir, workspace, commentedFiles) {
    return pipe(
      map(raw => [
        pipe(
          propOr('???', 'filename'),
          slugWord,
          x => basename(x, '.mdx'),
          toLower
        )(raw),
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
          // TODO: this broke when we moved away from consolidation in doctor-general,
          // metaName should also yield to title, but this is a temp fix
          map(([title, { metaName }]) => [metaName, metaName]),
          // TODO: this is also a minor hack in order to make
          // indexes work while we fix things further downstream
          when(
            () => workspace !== 'doctor-general',
            raw => prepend(['index', last(head(raw))], raw)
          ),
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
