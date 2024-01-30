import { map, pipe, last, head } from 'ramda'
import { resolve as resolveF, fork, debugMode } from 'fluture'
import { removeFileWithConfig } from 'file-system'
import {
  renderComments,
  writeCommentsToFiles,
  renderFileWith,
  processCurriedComment,
  processComments,
  uncommentBlock,
  stripLeadingComment,
  stripEmptyCommentLines,
  isAsterisky,
  getPageSummary,
  matchLinks,
  getImportsForTests,
  hasExample,
  objectifyComments,
  getExample,
  structureKeywords,
} from './comment'

debugMode(true)

const CANONICAL_FILE = `



/**
 * Nice!
 * @name hooray
 * @private
 * @see {@link hey-now.coolBiz}
 * @example
 * \`\`\`ts
 * tsDrools = 'obviously'
 * \`\`\`
 */`.split('\n')

const CANONICAL_COMMENTS = [
  [
    [4, '/**'],
    [5, ' * Nice, we support multiline'],
    [6, ' * descriptions'],
    [7, ' * now'],
    [8, ' * @name hooray'],
    [9, ' * @private'],
    [10, ' * @see {@link hey-now.coolBiz}'],
    [11, ' * @example'],
    [12, ' * ```ts'],
    [13, " * const tsDrools = 'obviously'"],
    [14, ' * const nowWithIndents = {'],
    [15, ' *   a: {'],
    [16, ' *     b: {'],
    [17, ' *       c: true'],
    [18, ' *     }'],
    [19, ' *   }'],
    [20, ' * }'],
    [23, ' * ```'],
    [24, ' * @postExample Really nice, proper parsies!'],
    [25, ' * @see {@link secondary.link}'],
    [26, ' */'],
  ],
  [
    [28, ' /**'],
    [29, ' * @page coolpage'],
    [30, ' */'],
  ],
]

test('objectifyComments', () => {
  expect(objectifyComments).toBeTruthy()
  expect(
    objectifyComments('my-cool-file', CANONICAL_FILE, CANONICAL_COMMENTS)
  ).toEqual([
    {
      addTo: '',
      end: pipe(head, last, head)(CANONICAL_COMMENTS),
      fileGroup: '',
      keywords: [
        '@example',
        '@link',
        '@name',
        '@postExample',
        '@private',
        '@see',
      ],
      lines: [
        'Nice, we support multiline',
        'descriptions',
        'now',
        '@name hooray',
        '@private',
        '@see {@link hey-now.coolBiz}',
        '@example',
        '```ts',
        "const tsDrools = 'obviously'",
        'const nowWithIndents = {',
        '  a: {',
        '    b: {',
        '      c: true',
        '    }',
        '  }',
        '}',
        '```',
        '@postExample Really nice, proper parsies!',
        `@see {@link secondary.link}`,
      ],
      links: ['hey-now.coolBiz', 'secondary.link'],
      start: pipe(head, head, head)(CANONICAL_COMMENTS),
      structure: {
        description: 'Nice, we support multiline descriptions now',
        private: true,
        name: 'hooray',
        see: ['{@link hey-now.coolBiz}', '{@link secondary.link}'],
        postExample: 'Really nice, proper parsies!',
        example: [
          '```ts',
          "const tsDrools = 'obviously'",
          'const nowWithIndents = {',
          '  a: {',
          '    b: {',
          '      c: true',
          '    }',
          '  }',
          '}',
          '```',
        ],
      },
      summary: 'Nice, we support multiline descriptions now',
    },
    {
      addTo: '',
      end: 30,
      fileGroup: '',
      keywords: ['@page'],
      lines: ['@page coolpage'],
      links: [],
      start: 28,
      structure: {
        name: ['coolpage'],
        description: '',
        page: ['coolpage'],
      },
      summary: '',
    },
  ])
})
test('getExample', () => {
  expect(getExample).toBeTruthy()
  const rando = Math.random()
  expect(getExample([`/**`, ` * @example`, ` * ${rando}`, `*/`], 3, 0)).toEqual(
    `@example\n${rando}`
  )

  const rawLines = [
    '* Ouroboric summary',
    '* @name getExample',
    '* @example',
    '* ```js',
    '* getExample(rawLines)',
    '* ```',
  ]
  expect(getExample(rawLines, 5, 3)).toEqual('getExample(rawLines)')
})

test('structureKeywords', () => {
  expect(structureKeywords).toBeTruthy()
  expect(
    structureKeywords(
      CANONICAL_FILE,
      CANONICAL_COMMENTS[0],
      pipe(last, last, head)(CANONICAL_COMMENTS)
    )
  ).toEqual({
    description: 'Nice, we support multiline descriptions now',
    example: [
      '```ts',
      "const tsDrools = 'obviously'",
      'const nowWithIndents = {',
      '  a: {',
      '    b: {',
      '      c: true',
      '    }',
      '  }',
      '}',
      '```',
    ],
    name: 'hooray',
    postExample: 'Really nice, proper parsies!',
    private: true,
    see: ['{@link hey-now.coolBiz}', '{@link secondary.link}'],
  })
})

test('hasExample', () => {
  const sample = { structure: { example: ['test=true'] } }
  expect(hasExample(sample)).toBeTruthy()
  expect(hasExample('zipzap')).toBeFalsy()
})

test('getImportsForTests', () => {
  const file = {
    comments: [
      {
        structure: {
          curried: [
            { name: 'coolWithConfig', lines: ['test=true'] },
            { name: 'cool', lines: ['test=true'] },
          ],
        },
      },
      {
        structure: { name: 'otherFunc', example: ['test=true'] },
      },
    ],
  }
  expect(getImportsForTests(file)).toEqual([
    'otherFunc',
    'coolWithConfig',
    'cool',
  ])
})

test('matchLinks', () => {
  expect(matchLinks([])).toEqual([])
  expect(matchLinks([`{@link cool}`])).toEqual(['cool'])
})

test('getPageSummary', () => {
  const rawLines = [
    ' * @pageSummary Hey cool this is a multi-line',
    ' * description of stuff in the whole file',
    ' * @page testPageSummary',
    ' * @huh notSure',
  ]
  expect(getPageSummary(rawLines, Infinity, 0)).toEqual([
    'Hey cool this is a multi-line',
    'description of stuff in the whole file',
  ])
  expect(getPageSummary([' * hey', ' * there'], Infinity, 0)).toEqual([
    'hey',
    'there',
  ])
})

test('isAsterisky', () => {
  expect(isAsterisky('     * ')).toBeTruthy()
  expect(isAsterisky('*')).toBeTruthy()
  expect(isAsterisky('obelisk')).toBeFalsy()
})

test('stripEmptyCommentLines', () => {
  expect(stripEmptyCommentLines('     *')).toEqual('')
  expect(stripEmptyCommentLines('hooray!')).toEqual('hooray!')
})

test('stripLeadingComment', () => {
  expect(stripLeadingComment('     /**')).toEqual('')
  expect(stripLeadingComment('    */')).toEqual('')
  expect(stripLeadingComment(' * comment! ')).toEqual(' comment!')
  expect(
    stripLeadingComment('                 *     comment!        ')
  ).toEqual('     comment!')
})

test('uncommentBlock', () => {
  expect(
    uncommentBlock([
      [1, ''],
      [2, ''],
      [3, ''],
      [4, '/**'],
      [5, ' * describo'],
      [6, ' * @name namo'],
      [7, ' */'],
    ])
  ).toEqual([
    [1, ''],
    [2, ''],
    [3, ''],
    [4, ''],
    [5, ' describo'],
    [6, ' @name namo'],
    [7, ''],
  ])
})

test('processComments', () => {
  const input = Math.round(Math.random() * 1e3)
  expect(processComments(() => 'huh?', { process: y => y * 2 }, input)).toEqual(
    input * 2
  )
  const fn = jest.fn()
  processComments(fn, false, input)
  expect(fn).toHaveBeenCalled()
})

/* eslint-disable max-len */
const CURRIED_EXAMPLE = `
/**
 * Consume external commands as a Future-wrapped value.
 * @future
 * @curried
 *  1. execWithConfig - Passes all possible configuration values plus a cancellation function.
 *
 *     @example
 *     \`\`\`js
 *     import { execWithConfig } from 'kiddo'
 *     import { fork } from 'fluture'
 *     fork(console.warn)(console.log)(
 *       execWithConfig(
 *         function customCancellationFunction() {},
 *         'echo',
 *         { cleanup: true },
 *         ['ahoy']
 *       )
 *     )
 *     \`\`\`
 *
 *  2. execWithCancel - Eschews any configuration and instead only expects a cancellation function, command and arguments.
 *
 *     @example
 *     \`\`\`js
 *     import { execWithCancel } from 'kiddo'
 *     import { fork } from 'fluture'
 *     fork(console.warn)(console.log)(
 *       execWithCancel(
 *         function customCancellationFunction() {},
 *         'echo',
 *         ['ahoy']
 *       )
 *     )
 *     \`\`\`
 *
 *  3. exec - Eschews any configuration or cancellation function. Needs only command and arguments.
 *
 *     @example
 *     \`\`\`js test=true
 *     import { fork } from 'fluture'
 *     // drgen-import-above
 *     const blah = Math.round(Math.random() * 100000)
 *     fork(done)(z => {
 *       expect(z.stdout).toEqual('' + blah)
 *       done()
 *     })(exec('echo', [blah]))
 *     \`\`\`
 */`
  .split('\n')
  .map((x, i) => [i + 1, x])

test('processCurriedComment', () => {
  const out = pipe(
    objectifyComments('hey-there.js', 'filefile'),
    map(processCurriedComment)
  )([CURRIED_EXAMPLE])
  expect(out).toMatchSnapshot()
})

test('processCurriedComment - structure.curried not present', () => {
  const out = pipe(map(processCurriedComment))([{ cool: 'so cool' }])
  expect(out).toEqual([{ cool: 'so cool' }])
})

test('renderFileWith', () => {
  const processor = { renderer: (a, b) => b, postRender: (a, b) => b }
  const rendered = renderFileWith(processor, { comments: 'abc'.split('') })
  expect(rendered).toEqual(['a', 'b', 'c'])
})
const GENERATED_FILES = []

const PROCESSED_COMMENT_BLOCK = {
  'generated-fake': [
    {
      slugName: 'helpers',
      package: 'monorail',
      pageTitle: 'helpers',
      pageSummary:
        'Built-in helpers for making custom plugins more robust. The "helpers" are the third parameter passed to a custom plugin\'s function.',
      filename: 'packages/monorail/helpers.js',
      comments: [
        {
          start: 22,
          end: 25,
          summary:
            '@pageSummary Built-in helpers for making custom plugins more robust. The "helpers" are the third parameter passed to a custom plugin\'s function.',
          links: [],
          fileGroup: '',
          addTo: '',
          structure: {
            pageSummary: [
              'Built-in helpers for making custom plugins more robust. The "helpers" are the third parameter passed to a custom plugin\'s function.',
            ],
            page: 'helpers',
            name: 'helpers',
            detail: 22,
          },
          keywords: ['@page', '@pageSummary'],
          filename: 'packages/monorail/helpers.js',
          package: 'monorail',
        },
      ],
      order: 0,
      links: [],
      workspace: 'generated-fake',
    },
  ],
}

test('writeCommentsToFiles', done => {
  const processor = {
    renderer: (a, b) => b,
    postRender: (a, b) => {
      return b.map(c => c.summary).join('\n')
    },
    output: y => {
      const name = y.workspace + '/' + y.filename
      GENERATED_FILES.push(name)
      return name
    },
  }
  const outputDir = __dirname
  fork(done)(x => {
    expect(x).toEqual([
      '@pageSummary Built-in helpers for making custom plugins more robust. The "helpers" are the third parameter passed to a custom plugin\'s function.',
    ])
    done()
  })(writeCommentsToFiles({ processor, outputDir }, PROCESSED_COMMENT_BLOCK))
})

test.skip('renderComments', done => {
  const processor = {
    renderer: (a, b) => b,
    postRender: (a, b) => {
      return b.map(c => c.summary).join('\n')
    },
    group: 'cool',
    output: y => {
      const name = y.workspace + '/cool-' + y.filename
      GENERATED_FILES.push(name)
      return name
    },
  }
  const outputDir = __dirname
  fork(e => {
    // eslint-disable-next-line no-console
    console.log('WTF', e.toString(), e.stack)
    done()
  })(x => {
    // eslint-disable-next-line no-console
    console.log('XXXX', x)
    expect(x).toBeTruthy()
    done()
  })(
    renderComments(
      processor,
      outputDir,
      resolveF(PROCESSED_COMMENT_BLOCK['generated-fake'])
    )
  )
})

afterAll(done => {
  fork(done)(() => {
    done()
  })(removeFileWithConfig({ force: true, recursive: true }, 'generated-fake'))
})
