import { join as pathJoin } from 'node:path'
import { parallel } from 'fluture'
import {
  search,
  trimEnd,
  trimStart,
  isNotEmpty,
  autobox,
  repeat,
} from 'inherent'
import { TESTABLE_EXAMPLE } from './constants'
import {
  defaultTo,
  mergeRight,
  append,
  addIndex,
  identity as I,
  prop,
  always as K,
  objOf,
  any,
  ap,
  applySpec,
  both,
  chain,
  concat,
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

const imap = addIndex(map)
const ireduce = addIndex(reduce)

/*
 * Check to see if a comment object has an example with a `test=true`
 * tag within its structure
 * @name hasExample
 */
export const hasExample = ifElse(
  is(Object),
  pipe(pathOr('', ['structure', 'example']), includes(TESTABLE_EXAMPLE)),
  K(false)
)

/*
 * Pull all imports from a given file, including `@curried` examples
 * @name getImportsForTests
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

export const matchLinks = pipe(
  chain(match(LINK_REGEX)),
  map(z => slice('{@link '.length, z.length - 1, z))
)
const ORDERED_LIST_ITEM = /^\s\d*\.\s/g
const CURRIED_LIST_ITEM = /^\d+\.\s(\w+)\s-\s(.*)/g
const isListItem = testRegExp(ORDERED_LIST_ITEM)

const processCurriedItemSummary = pipe(split('-'), ([k, s]) => ({
  name: pipe(replace(/\d*\.\s*(.*)/, '$1'), trim)(k),
  summary: s.trim(),
}))

export function processCurriedComment(comment = {}) {
  const { structure = {}, ...subcomment } = comment
  const { example, curried = false, ...substructure } = structure
  if (curried) {
    return pipe(
      imap(function _getIndex(y, i) {
        return y === true ? i - 1 : false
      }),
      filter(I),
      append(Infinity),
      reduce(
        function aggregateExamples(agg, i) {
          const cut = example.slice(agg.prev, i)
          agg.examples.push(cut)
          agg.prev = i
          return agg
        },
        { prev: 0, examples: [] }
      ),
      prop('examples'),
      ireduce(function structureCurried(agg, x, i) {
        if (i === 0) {
          const first = processCurriedItemSummary(head(curried))
          first.lines = trimStart(x.join('\n'))
          return agg.concat(first)
        }
        const lead = head(x)
        const lines = slice(2, Infinity, x)
        const o = processCurriedItemSummary(lead)
        o.lines = trimStart(lines.join('\n'))
        return agg.concat(o)
      }, []),
      defaultTo([]),
      objOf('curried'),
      mergeRight(substructure),
      defaultTo({}),
      objOf('structure'),
      mergeRight(subcomment)
    )(example)
  }
  return comment
}

/*
 * Grab the summary from raw lines, given some indices to slice
 * @name getPageSummary
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

/*
 * Is it an asterisk with maybe some whitespace around it?
 * @name isAsterisky
 */
export const isAsterisky = both(is(String), pipe(trim, equals('*')))

/*
 * @name stripEmptyCommentLines
 */
export const stripEmptyCommentLines = when(isAsterisky, K(''))

/*
 * Grab the example from raw lines and some indices to slice
 * @name getExample
 * @signature List String -> Integer -> Integer -> String
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

export const stripLeadingComment = pipe(
  trim,
  when(equals('/**'), K('')),
  when(equals('*/'), K('')),
  when(startsWith('*'), pipe(slice(1, Infinity), trimEnd))
)

export function uncommentBlock(block) {
  return map(([lineNum, line]) => [lineNum, stripLeadingComment(line)], block)
}

const leadingSpaces = search(/\S|$/)

export const WHITESPACE_PRESERVING_TAGS = ['example', 'curried']

export const segmentBlock = pipe(
  reduce(
    function segmentLogicalGroupsOfCommentBlock(agg, [lineNum, line]) {
      const whitespace = leadingSpaces(line)
      const lineParts = line.split(' ').filter(I)
      const { structure } = agg
      const { current } = agg
      // eslint-disable-next-line prefer-const
      let [tag, ...additional] = lineParts
      const hasTag = startsWith('@', tag)
      if (!hasTag) {
        additional = lineParts
      }
      const cleanTag = hasTag ? tag.slice(1) : tag
      const currentStructure = structure?.[current] ?? []
      const indent =
        additional.indexOf('```') === -1 &&
        (WHITESPACE_PRESERVING_TAGS.includes(current) ||
          WHITESPACE_PRESERVING_TAGS.includes(cleanTag))
          ? repeat(' ', whitespace - 1)
          : ''
      const toAdd = indent + additional.join(' ')
      if (!current) {
        const key = hasTag ? cleanTag : 'description'
        return {
          structure: {
            ...structure,
            [key]: [toAdd],
          },
          current: key,
        }
      }

      if (hasTag) {
        const insert = additional.length ? toAdd : true
        const prev = structure?.[cleanTag] ?? false
        const value = prev
          ? // arrayify if there's a prior entry
            [...autobox(prev), insert]
          : insert
        return {
          structure: {
            ...structure,
            [cleanTag]: value,
          },
          current: cleanTag,
        }
      }
      const prior = Array.isArray(currentStructure)
        ? currentStructure
        : currentStructure !== true
        ? [currentStructure]
        : []
      const toInsert = [
        // if there's a prior entry that is an array, merge with it,
        // otherwise we inferred boolean on something multiline
        ...prior,
        toAdd,
      ]
      return {
        structure: {
          ...structure,
          [current]: toInsert,
        },
        current,
      }
    },
    { structure: {}, current: false }
  ),
  prop('structure'),
  ({ description: d = [], ...z }) => ({ ...z, description: d.join(' ') })
)

// structureKeywords :: List String -> CommentBlock -> Integer -> CommentStructure
export const structureKeywords = curry(
  function _structureKeywords(file, block) {
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

/*
 * @name objectifyComments
 * @signature String -> String -> List Comment -> List CommentBlock
 */
export const objectifyComments = curry(
  function _objectifyComments(filename, file, comments) {
    return pipe(
      reduce(
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
                const structure = structureKeywords(file, block)
                if (structure.page && !structure.name) {
                  structure.name = structure.page
                }
                return {
                  ...gen,
                  summary: structure.description, //  summarize(gen.lines),
                  links: matchLinks(gen.lines),
                  fileGroup: getFileGroup(structure),
                  addTo: addTo(structure),
                  structure,
                  // this pulls @link, which isn't part of what is captured by the current parse
                  keywords: pipe(unlines, findJSDocKeywords, uniq, z =>
                    z.sort()
                  )(gen.lines),
                }
              }
            )(block)
          ),
        []
      )
    )(comments)
  }
)

export const objectifyAllComments = curry(
  function _objectifyAllComments(filename, file, x) {
    return pipe(
      objectifyComments(filename, file),
      map(processCurriedComment)
      // map(processEphemeral)
    )(x)
  }
)

export const renderFileWith = curry(function _renderFileWith(
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
  log.comment('RAW', x)
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
        groupBy(processor?.group ?? 'unknown'),
        writeCommentsToFiles({ processor, outputDir })
      )
    )(x)
  }
)

/**
 * Process comments given a processor and an error handler
 * @name processComments
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
