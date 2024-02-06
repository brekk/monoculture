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
 * @see {@link other.thing}
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

/**
 * @page This Page Title Is Custom!
 * @pageSummary This is a comprehensive and explicit summary!
 * Inflammable is flammable? 
 */ 
`
  expect(parse(filename, content)).toEqual({
    comments: [
      {
        addTo: '',
        end: 11,
        fileGroup: '',
        keywords: ['@example', '@link', '@name', '@private', '@see'],
        lines: [
          'Very cool',
          '@name cool',
          '@private',
          '@see {@link emoji.sunglasses}',
          '@see {@link other.thing}',
          '@example',
          '```ts',
          "import { cool } from './parse'",
          '```',
        ],
        links: ['emoji.sunglasses', 'other.thing'],
        start: 1,
        structure: {
          description: 'Very cool',
          example: ['```ts', "import { cool } from './parse'", '```'],
          name: 'cool',
          private: true,
          see: ['{@link emoji.sunglasses}', '{@link other.thing}'],
        },
        summary: 'Very cool',
      },
      {
        addTo: '',
        end: 22,
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
        start: 15,
        structure: {
          description: 'Nice',
          example: ['```ts', "import { nice } from './parse'", '```'],
          name: 'nice',
        },
        summary: 'Nice',
      },
      {
        addTo: '',
        end: 28,
        fileGroup: '',
        keywords: ['@page', '@pageSummary'],
        lines: [
          '@page This Page Title Is Custom!',
          '@pageSummary This is a comprehensive and explicit summary!',
          'Inflammable is flammable?',
        ],
        links: [],
        start: 24,
        structure: {
          description: '',
          name: 'This Page Title Is Custom!',
          page: ['This Page Title Is Custom!'],
          pageSummary: [
            'This is a comprehensive and explicit summary!',
            'Inflammable is flammable?',
          ],
        },
        summary: '',
      },
    ],
    fileGroup: undefined,
    filename: 'i-yam-what-i.yaml',
    links: ['emoji.sunglasses', 'other.thing'],
    order: 0,
    package: 'i-yam-what-i.yaml',
    pageSummary:
      'This is a comprehensive and explicit summary! Inflammable is flammable?',
    pageTitle: 'This Page Title Is Custom!',
    slugName: 'i-yam-what-i',
  })
})
test('parseFile', done => {
  const input = relativePathJoin(__dirname, './file.js')
  fork(done)(raw => {
    const cleanFilename = raw.filename.split('/').slice(-3).join('/')
    expect({ ...raw, filename: cleanFilename }).toMatchSnapshot()
    done()
  })(parseFile(false, input))
})

test('parseFile - debug', done => {
  const input = relativePathJoin(__dirname, './file.js')
  fork(done)(raw => {
    const cleanFilename = raw.filename.split('/').slice(-3).join('/')
    expect({ ...raw, filename: cleanFilename }).toMatchSnapshot()
    done()
  })(parseFile(true, input))
})
