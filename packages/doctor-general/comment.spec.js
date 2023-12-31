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
    [5, ' * Nice!'],
    [6, ' * @name hooray'],
    [7, ' * @private'],
    [8, ' * @see {@link hey-now.coolBiz}'],
    [9, ' * @example'],
    [10, ' * ```ts'],
    [11, " * tsDrools = 'obviously'"],
    [12, ' * ```'],
    [13, ' */'],
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
      keywords: ['@example', '@link', '@name', '@private', '@see'],
      lines: [
        'Nice!',
        '@name hooray',
        '@private',
        '@see {@link hey-now.coolBiz}',
        '@example',
        '```ts',
        "tsDrools = 'obviously'",
        '```',
      ],
      links: ['hey-now.coolBiz'],
      start: pipe(last, head, head)(CANONICAL_COMMENTS),
      structure: {
        example: `\`\`\`ts
tsDrools = 'obviously'
\`\`\``,
        private: true,
        name: 'hooray',
        see: ['hey-now.coolBiz'],
      },
      summary: 'Nice!',
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
    example: `\`\`\`ts
tsDrools = 'obviously'
\`\`\``,
    private: true,
    name: 'hooray',
    see: ['hey-now.coolBiz'],
  })
})
