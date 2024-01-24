import { join as pathJoin } from 'node:path'
import { parallel } from 'fluture'
import { isNotEmpty, autobox } from 'inherent'
import { TESTABLE_EXAMPLE } from './constants'
import {
  prop,
  __ as $,
  addIndex,
  always as K,
  any,
  ap,
  applySpec,
  both,
  chain,
  concat,
  cond,
  curry,
  defaultTo,
  either,
  equals,
  filter,
  findIndex,
  flatten,
  groupBy,
  head,
  identity as I,
  ifElse,
  includes,
  is,
  last,
  length,
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
import { findJSDocKeywords, cleanupKeywords } from './file'
import { formatComment, trimComment, wipeComment } from './text'

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

export const handleSpecificKeywords = curry(
  function _handleSpecificKeywords(keyword, value, rest, rawLines, end, i) {
    log.comment('RAW SPEC', { keyword, value, rest, rawLines, end, i })
    // there should only be three(?) kinds of tags
    // 1. single-line - ` * @blah zipzap zipzop` / ` * @blah {aFormat} [toParse] no newline yet`
    // 2. multi-line - ` * @heyYou it is actually
    //  * not syllable based, you know
    //  * cutting lines are of import` -- these are left associative and
    //    stop at the beginning of the first tag which starts a line
    // 3. ephemeral - these tags do specific "magical" things,
    //    like `@group` / `@page` / `@pageSummary` / `@addTo` / `@curried`
    //    and some of these tags then are not present in the resulting structure
    return pipe(
      cond([
        [equals('exported'), () => true],
        [equals('pageSummary'), () => getPageSummary(rawLines, end, i)],
        // curried function definitions afford named variants of the same function
        // see rawLines-system/fs.js for an example
        [equals('curried'), () => getCurriedDefinition(rawLines, end, i)],
        // if example found, pull from raw rawLines
        [equals('example'), () => getExample(rawLines, end, i)],
        // if see found, do some light cleanup
        [equals('see'), () => pipe(head, slice(0, -1))(rest)],
        // Consume pages + names as sentences
        [
          either(equals('name'), equals('page')),
          () => trim(`${value} ${rest.join(' ')}`),
        ],
        // if an array value, concat it
        [() => rest.length, () => [value, ...rest]],
        // otherwise just return the value
        [K(true), () => value],
      ])
    )(keyword)
  }
)

/**
 * @name structureComment
 * @example
 * ```js test=true
 * expect(structureComment([0, ' * @cool nice yes'])).toEqual('???')
 * ```
 */
export function structureComment([i, line]) {
  return [
    i,
    ifElse(
      pipe(findJSDocKeywords, isNotEmpty),
      pipe(wipeComment, cleanupKeywords),
      K(false)
    )(line),
  ]
}

const stripLeadingComment = pipe(
  trim,
  when(equals('/**'), K('')),
  when(equals('*/'), K('')),
  when(startsWith('*'), pipe(slice(1, Infinity), trim))
)

function uncommentBlock(block) {
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
      log.comment(
        `!!! ${cleanTag} -> (current: ${current}, hasTag: ${hasTag})`,
        additional
      )
      log.comment(`-> current`, structure[current])
      const currentStructure = current ? structure?.[current] : []
      const toAdd = additional.join(' ')
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

      if (!current) {
        return {
          structure: {
            ...structure,
            description: [toAdd],
          },
          current: 'description',
        }
      }
      return {
        structure: {
          ...structure,
          [current]: [
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
  z => ({ ...z, description: z.description.join(' ') })
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

const summarize = lines => {
  const stripped = reject(equals('*'), lines)
  return pipe(
    addIndex(map)((x, i) => ifElse(startsWith('@'), K(i), K(false))(x)),
    filter(I),
    head,
    defaultTo(length(stripped)),
    slice(0, $, stripped),
    unlines
  )(stripped)
}

// getFileGroup :: String -> Comment
const getFileGroup = propOr('', 'group')
const addTo = propOr('', 'addTo')

// objectifyComments :: Boolean -> String -> List Comment -> List CommentBlock
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
                summary: summarize(gen.lines),
                links: matchLinks(gen.lines),
                fileGroup: getFileGroup(structure),
                addTo: addTo(structure),
                structure,
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

export const processComments = curry(
  function _processComments(bad, processor, x) {
    try {
      return processor.process(x)
    } catch (e) {
      bad(e)
    }
  }
)
