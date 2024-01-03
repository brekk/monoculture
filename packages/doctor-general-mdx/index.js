// export * from './comment-documentation'
// export * from './next-meta-files'
import { commentToMarkdown } from './renderer-markdown'
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
  group: 'testPath',
  process: filterAndStructureComments,
  renderer: ({ file, imports }, raw) =>
    commentToMarkdown(file.slugName, imports, raw),
  postRender: ({ file }, raw) => [
    `# ${file.slugName}`,
    file.pageSummary,
    ...raw,
  ],
}
