import { pipe, last, head } from 'ramda'
import {
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
]

test('objectifyComments', () => {
  expect(objectifyComments).toBeTruthy()
  expect(
    objectifyComments('my-cool-file', CANONICAL_FILE, CANONICAL_COMMENTS)
  ).toEqual([
    {
      addTo: '',
      end: pipe(last, last, head)(CANONICAL_COMMENTS),
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
      start: pipe(last, head, head)(CANONICAL_COMMENTS),
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
    example: ['```ts', "tsDrools = 'obviously'", '```'],
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
