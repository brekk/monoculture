import { fork } from 'fluture'
import { relativePathJoin } from 'file-system'

import { parse, parseFile } from './parse'

test('parse', () => {
  const filename = 'i-yam-what-i.yaml'
  const content = `
/**
 * Very cool
 * @name cool
 * @private
 * @see {@link emoji.sunglasses}
 * @example
 * \`\`\`ts
 * import { cool } from './parse'
 * \`\`\`
 */

the content here will be thrown right in the trash

/**
 * Nice
 * @name nice
 * @example
 * \`\`\`ts
 * import { nice } from './parse'
 * \`\`\`
 */
`
  expect(parse('root', filename, content)).toEqual({
    comments: [
      {
        addTo: '',
        end: 10,
        fileGroup: '',
        keywords: ['@example', '@link', '@name', '@private', '@see'],
        lines: [
          'Very cool',
          '@name cool',
          '@private',
          '@see {@link emoji.sunglasses}',
          '@example',
          '```ts',
          "import { cool } from './parse'",
          '```',
        ],
        links: ['emoji.sunglasses'],
        start: 1,
        structure: {
          example: `\`\`\`ts
import { cool } from './parse'
\`\`\``,
          name: 'cool',
          private: true,
          see: ['emoji.sunglasses'],
        },
        summary: 'Very cool',
      },
      {
        addTo: '',
        end: 21,
        fileGroup: '',
        keywords: ['@example', '@name'],
        lines: [
          'Nice',
          '@name nice',
          '@example',
          '```ts',
          "import { nice } from './parse'",
          '```',
        ],
        links: [],
        start: 14,
        structure: {
          example: `\`\`\`ts
import { nice } from './parse'
\`\`\``,
          name: 'nice',
        },
        summary: 'Nice',
      },
    ],
    fileGroup: undefined,
    filename: 'i-yam-what-i.yaml',
    links: ['emoji.sunglasses'],
    order: 0,
    package: 'i-yam-what-i.yaml',
    pageSummary: '',
    pageTitle: undefined,
    slugName: 'i-yam-what-i',
  })
})
test('parseFile', done => {
  const input = relativePathJoin(__dirname, './file.js')
  fork(done)(raw => {
    const cleanFilename = raw.filename.split('/').slice(-3).join('/')
    expect({ ...raw, filename: cleanFilename }).toMatchSnapshot()
    done()
  })(parseFile(false, 'root', input))
})
