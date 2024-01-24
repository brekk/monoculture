import { pipe, last, head } from 'ramda'
import { objectifyComments, getExample, structureKeywords } from './comment'

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
    [13, " * tsDrools = 'obviously'"],
    [14, ' * ```'],
    [15, ' * @postExample Really nice, proper parsies!'],
    [10, ' * @see {@link secondary.link}'],
    [16, ' */'],
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
        "tsDrools = 'obviously'",
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
        example: ['```ts', "tsDrools = 'obviously'", '```'],
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
