// export * from './comment-documentation'
import { prepareMetaFiles } from './next-meta-files'
import { curry } from 'ramda'
import { commentToMarkdown } from './renderer-markdown'
import { log } from './log'
import { slugWord } from 'knot'
import {
  slug,
  pullPageTitleFromAnyComment,
  filterAndStructureComments,
} from './comment-documentation'

export default {
  output: ({ fileGroup, filename, comments }) => {
    const title = pullPageTitleFromAnyComment(comments)
    const sliced = title || slug(filename)
    const result = slugWord(sliced) + '.mdx'
    return (fileGroup ? fileGroup + '/' : '') + result
  },
  group: 'workspace',
  process: filterAndStructureComments,
  postProcess: curry(({ outputDir, workspace }, commentedFiles, filesToWrite) =>
    filesToWrite.concat(prepareMetaFiles(outputDir, workspace, commentedFiles))
  ),
  renderer: curry(({ file, imports }, raw) => {
    log.main('file', file)
    return commentToMarkdown(file.slugName, imports, raw)
  }),
  postRender: curry(({ file }, raw) =>
    [`# ${file.slugName}`, file.pageSummary, ...raw].join('\n\n')
  ),
}
