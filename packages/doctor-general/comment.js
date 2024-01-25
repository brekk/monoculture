import { join as pathJoin } from 'node:path'
import { parallel } from 'fluture'
import { isNotEmpty, autobox } from 'inherent'
import { TESTABLE_EXAMPLE } from './constants'
import {
  prop,
  always as K,
  any,
  ap,
  applySpec,
  both,
  chain,
  concat,
  cond,
  curry,
  equals,
  filter,
  findIndex,
  flatten,
  groupBy,
  head,
  ifElse,
  includes,
  is,
  last,
  map,
  match,
  pathOr,
  pipe,
  propOr,
  reduce,
  reject,
  replace,
  slice,
  split,
  startsWith,
  test as testRegExp,
  toPairs,
  trim,
  uniq,
  when,
} from 'ramda'
import { writeFileWithAutoPath } from 'file-system'
import { unlines } from 'knot'

import { log } from './log'
import { findJSDocKeywords } from './file'
import { formatComment, trimComment } from './text'

/**
 * Check to see if a comment has an example within its structure.
 * @name hasExample
 * @example
 * ```js test=true
 * expect(hasExample({structure: {example: [`test=true`]}})).toBeTruthy()
 * expect(hasExample({})).toBeFalsy()
 * expect(hasExample('zipzop')).toBeFalsy()
 * ```
 */
export const hasExample = ifElse(
  is(Object),
  pipe(pathOr('', ['structure', 'example']), includes(TESTABLE_EXAMPLE)),
  K(false)
)

/**
 * Pull all imports from a given file, including `@curried` examples
 * @name getImportsForTests
 * @example
 * ```js test=true
 * const file = { comments: [
 *   {
 *     structure: { curried: [
 *       { name: 'coolWithConfig', lines: ['test=true'] },
 *       { name: 'cool', lines: ['test=true'] }
 *     ] }
 *   },
 *   {
 *     structure: { name: 'otherFunc', example: ['test=true'] }
 *   }
 * ] }
 *
 * expect(getImportsForTests(file)).toEqual(['otherFunc', 'coolWithConfig', 'cool'])
 * ```
 */
export const getImportsForTests = pipe(
  propOr([], 'comments'),
  map(
    pipe(
      autobox,
      ap([
        pathOr(false, ['structure', 'name']),
        hasExample,
        pathOr([], ['structure', 'curried']),
      ])
    )
  ),
  reduce(function handleCurriedExamples(agg, [a, b, c]) {
    return pipe(
      concat(
        isNotEmpty(c)
          ? map(function _testCurriedExample({ name, lines: example }) {
              return [name, includes(TESTABLE_EXAMPLE)(example)]
            })(c)
          : [[a, b]]
      )
    )(agg)
  }, []),
  filter(([a, b]) => a && b),
  map(head)
)

export const LINK_REGEX = /\{@link (.*)+\}/g

/**
 * @name matchLinks
 * @example
 * ```js test=true
 * expect(matchLinks([])).toEqual([])
 * expect(matchLinks([`{@link cool}`])).toEqual(['cool'])
 * ```
 */
export const matchLinks = pipe(
  chain(match(LINK_REGEX)),
  map(z => slice('{@link '.length, z.length - 1, z))
)
const ORDERED_LIST_ITEM = /^\s\d*\.\s/g
const CURRIED_LIST_ITEM = /^\d+\.\s(\w+)\s-\s(.*)/g
const isListItem = testRegExp(ORDERED_LIST_ITEM)

export const getCurriedDefinition = curry(
  function _getCurriedDefinition(file, end, i) {
    return pipe(
      slice(i + 1, end),
      map(
        pipe(trimComment, when(pipe(trim, equals('*')), K('')), line => [
          isListItem(line),
          line,
        ])
      ),
      reduce(
        function findingCurriedDefinitions(
          { subject, lines, defs },
          [isDefinition, content]
        ) {
          return isDefinition
            ? {
                defs: lines.length ? [...defs, { lines, subject }] : defs,
                lines: [],
                subject: content,
              }
            : {
                subject,
                defs,
                lines: [
                  ...lines,
                  content.startsWith('    ') ? content.slice(4) : content,
                ],
              }
        },
        { subject: null, lines: [], defs: [] }
      ),
      function handleFinalDefinition({ subject, defs, lines }) {
        return [...defs, { lines, subject }]
      },
      map(function reformatCurriedDefs({ lines, subject }) {
        const matched = subject
          ? trim(subject).replace(CURRIED_LIST_ITEM, '$1⩇$2')
          : ''
        const [name, summary] = split('⩇', matched)
        return {
          name,
          summary,
          lines: pipe(reject(equals('@example')), unlines)(lines),
        }
      })
    )(file)
  }
)

/**
 * Grab the summary from raw lines, given some indices to slice
 * @name getPageSummary
 * @example
 * ```js test=true
 * const rawLines = [
 *   ' * @pageSummary Hey cool this is a multi-line',
 *   ' * description of stuff in the whole file',
 *   ' * @page testPageSummary',
 *   ' * @huh notSure'
 * ]
 * expect(
 *   getPageSummary(rawLines, Infinity, 0)
 * ).toEqual([
 *   'Hey cool this is a multi-line',
 *   'description of stuff in the whole file'
 * ])
 * expect(
 *   getPageSummary([' * hey', ' * there'], Infinity, 0)
 * ).toEqual(['hey', 'there'])
 * ```
 */
export const getPageSummary = (rawLines, end, i) =>
  pipe(
    slice(i, end),
    map(pipe(trimComment, replace(/^\*$/g, ''))),
    filter(trim),
    map(replace(/@pageSummary\s/g, '')),
    function pageExclusion(lines) {
      // handle @page being thrown into @pageSummary
      const ex = findIndex(any(startsWith('@')), lines)
      return ex > -1 ? slice(0, ex, lines) : lines
    }
  )(rawLines)

/**
 * Is it an asterisk with maybe some whitespace around it?
 * @name isAsterisky
 * @example
 * ```js test=true
 * expect(isAsterisky('     * ')).toBeTruthy()
 * expect(isAsterisky('*')).toBeTruthy()
 * expect(isAsterisky('obelisk')).toBeFalsy()
 * ```
 */
export const isAsterisky = both(is(String), pipe(trim, equals('*')))

/**
 * @name stripEmptyCommentLines
 * @example
 * ```js test=true
 * expect(stripEmptyCommentLines('     *')).toEqual('')
 * expect(stripEmptyCommentLines('hooray!')).toEqual('hooray!')
 */
export const stripEmptyCommentLines = when(isAsterisky, K(''))

/*
 * Grab the example from raw lines and some indices to slice
 * @name getExample
 * @signature List String -> Integer -> Integer -> String
 * @example
 * ```js test=true
 * const rawLines = [
 *   '* Ouroboric summary',
 *   '* @name getExample',
 *   '* @example',
 *   '* ```js',
 *   '* getExample(rawLines)',
 *   '* ```',
 * ]
 * expect(getExample(rawLines, 5, 3)).toEqual('getExample(rawLines)')
 * ```
 */
export const getExample = curry(function _getExample(rawLines, end, i) {
  return pipe(
    slice(i + 1, end),
    map(pipe(trimComment, stripEmptyCommentLines)),
    unlines
  )(rawLines)
})
// there should only be three(?) kinds of tags
// 1. single-line - ` * @blah zipzap zipzop` / ` * @blah {aFormat} [toParse] no newline yet`
// 2. multi-line - ` * @hey You it is actually
//  * not syllable based, you know
//  * cutting lines are of import` -- these are left associative and
//    stop at the beginning of the first tag which starts a line
// 3. ephemeral - these tags do specific "magical" things,
//    like `@group` / `@page` / `@pageSummary` / `@addTo` / `@curried`
//    and some of these tags then are not present in the resulting structure

export const handleEphemeralKeywords = curry(
  function _handleEphemeralKeywords(keyword, value, rest, rawLines, end, i) {
    return pipe(
      cond([
        [equals('pageSummary'), () => getPageSummary(rawLines, end, i)],
        [equals('curried'), () => getCurriedDefinition(rawLines, end, i)],
      ])
    )(keyword)
  }
)

/**
 * Given a line within a magic comment block, remove the leading asterisks
 * @name stripLeadingComment
 * @example
 * ```js test=true
 * import { MAGIC_COMMENT_START as START, MAGIC_COMMENT_END as END } from '../constants'
 * // drgen-import-above
 * expect(stripLeadingComment('     ' + START)).toEqual('')
 * expect(stripLeadingComment(END)).toEqual('')
 * expect(stripLeadingComment(' * hey cool!')).toEqual('hey cool!')
 * ```
 */
export const stripLeadingComment = pipe(
  trim,
  when(equals('/**'), K('')),
  when(equals('*/'), K('')),
  when(startsWith('*'), pipe(slice(1, Infinity)))
)

export function uncommentBlock(block) {
  return map(([lineNum, line]) => [lineNum, stripLeadingComment(line)], block)
}

const segmentBlock = pipe(
  reduce(
    function segmentLogicalGroupsOfCommentBlock(agg, [lineNum, line]) {
      const lineParts = line.split(' ')
      const { structure } = agg
      const { current } = agg
      // eslint-disable-next-line prefer-const
      let [tag, ...additional] = lineParts
      const hasTag = startsWith('@', tag)
      if (!hasTag) {
        additional = lineParts
      }
      const cleanTag = hasTag ? tag.slice(1) : tag
      const currentStructure = current ? structure?.[current] : []
      const toAdd = additional.join(' ')
      if (!current) {
        return {
          structure: {
            ...structure,
            description: [toAdd],
          },
          current: 'description',
        }
      }
      if (hasTag) {
        const insert = additional.length ? toAdd : true
        const prev = structure?.[cleanTag] ?? false
        return {
          structure: {
            ...structure,
            [cleanTag]: prev
              ? // arrayify if there's a prior entry
                [...autobox(prev), insert]
              : insert,
          },
          current: cleanTag,
        }
      }

      return {
        structure: {
          ...structure,
          [current]: [
            // if there's a prior entry that is an array, merge with it,
            // otherwise we inferred boolean on something multiline
            ...(Array.isArray(currentStructure) ? currentStructure : []),
            toAdd,
          ],
        },
        current,
      }
    },
    { structure: {}, current: false }
  ),
  prop('structure'),
  z => ({ ...z, description: (z?.description ?? []).join(' ') })
)

// structureKeywords :: List String -> CommentBlock -> Integer -> CommentStructure
export const structureKeywords = curry(
  function _structureKeywords(file, block, end) {
    return pipe(
      uncommentBlock,
      filter(pipe(last, isNotEmpty)),
      segmentBlock
      /*
      map(function _handleSpecificRemap([i, [keyword, value = true, ...rest]]) {
        return [
          i,
          [keyword, handleSpecificKeywords(keyword, value, rest, file, end, i)],
        ]
      }),
      */
    )(block)
  }
)

// getFileGroup :: String -> Comment
const getFileGroup = propOr('', 'group')
const addTo = propOr('', 'addTo')

/**
 * @name objectifyComments
 * @signature String -> String -> List Comment -> List CommentBlock
 * @example
 * ```js test=true
 * expect(objectifyComments('x', 'x', [])).toEqual([])
 * ```
 */
export const objectifyComments = curry(
  function _objectifyComments(filename, file, comments) {
    return reduce(
      (agg, block) =>
        agg.concat(
          pipe(
            // pass one
            applySpec({
              start: pipe(head, head),
              end: pipe(last, head),
              lines: formatComment,
            }),
            // pass two
            gen => {
              const structure = structureKeywords(file, block, gen.end)
              if (structure.page && !structure.name) {
                structure.name = structure.page
                structure.detail = gen.start
              }
              return {
                ...gen,
                summary: structure.description, //  summarize(gen.lines),
                links: matchLinks(gen.lines),
                fileGroup: getFileGroup(structure),
                addTo: addTo(structure),
                structure,
                // this pulls @link, which isn't part of what is captured by the current parse
                keywords: pipe(unlines, findJSDocKeywords, uniq, z => z.sort())(
                  gen.lines
                ),
              }
            }
          )(block)
        ),
      [],
      comments
    )
  }
)

const renderFileWith = curry(function _renderFileWith(
  { renderer, postRender },
  file
) {
  const info = { imports: getImportsForTests(file), file }
  return pipe(
    // XXX: we can't be tacit with this or we end up
    // forcing our processor to remember to be curried
    // which is a PITA to debug downstream
    map(function applyProcessorRenderer(raw) {
      return renderer(info, raw)
    }),
    log.verbose('rendered'),
    function applyProcessorPostRender(raw) {
      return postRender(info, raw)
    },
    log.verbose('postRendered')
  )(file.comments)
})

// hard to test until we set up a whole fixture + clean script
export const writeCommentsToFiles = curry(function _writeCommentsToFiles(
  { processor, outputDir },
  x
) {
  const { output: $outputPath, postProcess: $postProcess = (_a, _b, c) => c } =
    processor
  return pipe(
    toPairs,
    map(([workspace, commentedFiles]) => {
      const filesToWrite = map(file => {
        const filePathToWrite = pathJoin(
          outputDir,
          workspace,
          // this part is the structure of the file we wanna write
          $outputPath(file)
        )
        return pipe(
          renderFileWith(processor),
          writeFileWithAutoPath(filePathToWrite)
        )(file)
      })(commentedFiles)
      return $postProcess(
        { outputDir, workspace },
        commentedFiles,
        filesToWrite
      )
    }),
    flatten,
    parallel(10)
  )(x)
})

export const renderComments = curry(
  function _renderComments(processor, outputDir, x) {
    return chain(
      pipe(
        groupBy(propOr('unknown', processor.group)),
        writeCommentsToFiles({ processor, outputDir })
      )
    )(x)
  }
)

/**
 * Process comments given a processor and an error handler
 * @name processComments
 * @example
 * ```js test=true
 * const input = Math.round(Math.random() * 1e3)
 * expect(
 *   processComments(() => 'huh?', {process: y => y * 2}, input)
 * ).toEqual(input * 2)
 * const fn = jest.fn()
 * processComments(fn, false, input)
 * expect(fn).toHaveBeenCalled()
 */
export const processComments = curry(
  function _processComments(bad, processor, x) {
    try {
      return processor.process(x)
    } catch (e) {
      bad(e)
    }
  }
)
