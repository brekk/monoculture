import { join as pathJoin } from 'node:path'
import { parallel } from 'fluture'
import {
  __ as $,
  addIndex,
  always as K,
  any,
  applySpec,
  chain,
  cond,
  curry,
  defaultTo,
  either,
  equals,
  filter,
  findIndex,
  flatten,
  fromPairs,
  groupBy,
  head,
  identity as I,
  ifElse,
  isEmpty,
  join,
  last,
  length,
  map,
  match,
  pipe,
  propOr,
  reduce,
  reject,
  replace,
  slice,
  split,
  startsWith,
  tap,
  test as testRegExp,
  toPairs,
  trim,
  uniq,
  pathOr,
  ap,
} from 'ramda'
import { writeFileWithAutoPath } from 'file-system'
import { filterAndStructureTests, hasExample } from './comment-test'
import { filterAndStructureComments } from './comment-documentation'
import { commentToMarkdown } from './renderer-markdown'
import { commentToJestTest } from './renderer-jest'
import { prepareMetaFiles } from './next-meta-files'
import { log } from './log'
import { unlines } from 'knot'
import { autobox } from 'inherent'
import { cleanFilename, findJSDocKeywords, cleanupKeywords } from './file'
import { formatComment, trimComment, wipeComment, safeTrim } from './text'

export const getImportsForTests = file =>
  pipe(
    map(pipe(autobox, ap([pathOr(false, ['structure', 'name']), hasExample]))),
    filter(([a, b]) => a && b),
    map(head)
  )(file.comments)

const linkRegex = /\{@link (.*)+\}/g
export const matchLinks = pipe(
  chain(match(linkRegex)),
  map(z => slice('{@link '.length, z.length - 1, z))
)
const ORDERED_LIST_ITEM = /^\s\d*\.\s/g
const CURRIED_LIST_ITEM = /^\d+\.\s(\w+)\s-\s(.*)/g
const isListItem = testRegExp(ORDERED_LIST_ITEM)

export const getCurriedDefinition = curry(
  function _getCurriedDefinition(file, end, i) {
    return pipe(
      slice(i + 1, end),
      map(trimComment),
      map(pipe(trim, replace(/^\*$/g, ''))),
      filter(trim),
      map(line => [isListItem(line), line]),
      reduce(
        ({ subject, lines, defs }, [isDefinition, content]) => {
          if (isDefinition) {
            if (lines.length) {
              return {
                defs: [...defs, { lines, subject }],
                lines: [],
                subject: content,
              }
            }
            return {
              defs,
              lines: [],
              subject: content,
            }
          }
          return {
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
      ({ subject, defs, lines }) => [...defs, { lines, subject }],
      map(({ lines, subject }) => {
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

const getPageSummary = (file, end, i) =>
  pipe(
    slice(i, end),
    map(trimComment),
    map(replace(/^\*$/g, '')),
    filter(trim),
    map(replace(/@pageSummary\s/g, '')),
    lines => {
      // handle @page being thrown into @pageSummary
      const ex = findIndex(any(startsWith('@')), lines)
      return ex > -1 ? slice(0, ex, lines) : lines
    }
  )(file)

export const handleSpecificKeywords = curry(
  (keyword, value, rest, file, end, i) =>
    cond([
      [equals('exported'), () => true],
      [equals('pageSummary'), () => getPageSummary(file, end, i)],
      // curried function definitions afford named variants of the same function
      // see file-system/fs.js for an example
      [equals('curried'), () => getCurriedDefinition(file, end, i)],
      // if example found, pull from raw file
      [equals('example'), () => getExample(file, end, i)],
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
    ])(keyword)
)

// structureKeywords :: List String -> CommentBlock -> Integer -> CommentStructure
export const structureKeywords = curry(
  function _structureKeywords(file, block, end) {
    return pipe(
      map(([i, line]) => [
        i,
        ifElse(
          pipe(findJSDocKeywords, length, z => z > 0),
          pipe(wipeComment, cleanupKeywords),
          K(false)
        )(line),
      ]),
      filter(last),
      reject(pipe(last, head, isEmpty)),
      map(([i, [keyword, value = true, ...rest]]) => [
        i,
        [keyword, handleSpecificKeywords(keyword, value, rest, file, end, i)],
      ]),
      map(last),
      // fromPairs truncates duplicate keys, so we have to arrayify them
      reduce(
        (agg, [key, ...value]) =>
          agg[key] && Array.isArray(agg[key])
            ? { ...agg, [key]: agg[key].concat(value) }
            : { ...agg, [key]: value },
        {}
      ),
      toPairs,
      map(([k, v]) => [
        k,
        k !== 'see' && Array.isArray(v) && v.length === 1 ? v[0] : v,
      ]),
      fromPairs
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

// getExample :: List String -> Integer -> Integer -> String
export const getExample = curry(function _getExample(file, end, i) {
  return pipe(
    slice(i + 1, end),
    map(trimComment),
    reject(pipe(safeTrim, equals('*'))),
    unlines
  )(file)
})
const renderFile = curry(function _renderFile(testMode, file) {
  const importsForTests = getImportsForTests(file)
  return pipe(
    map(
      testMode
        ? commentToJestTest
        : commentToMarkdown(file.slugName, importsForTests)
    ),
    z => {
      const out = !testMode
        ? ['# ' + file.slugName, file.pageSummary, ...z]
        : [
            '// This test automatically generated by doctor-general.',
            `// Sourced from '${file.filename}', edits to this file may be erased.`,
            `import {
  ${importsForTests.join(',\n  ')}
} from '../${file.slugName}'\n`,
            ...z,
          ]
      return out
    },
    join(testMode ? '\n' : '\n\n')
  )(file.comments)
})

export const writeCommentsToFiles = curry(function _writeCommentsToFiles(
  { testMode, outputDir },
  x
) {
  return pipe(
    toPairs,
    map(([workspace, commentedFiles]) => {
      const filesToWrite = map(file => {
        const filePathToWrite = pathJoin(
          outputDir,
          workspace,
          // this part is the structure of the file we wanna write
          cleanFilename(testMode, file)
        )

        return writeFileWithAutoPath(
          filePathToWrite,
          renderFile(testMode, file)
        )
      })(commentedFiles)
      return testMode
        ? filesToWrite
        : filesToWrite.concat(
            prepareMetaFiles(testMode, outputDir, workspace, commentedFiles)
          )
    }),
    flatten,
    parallel(10)
  )(x)
})

export const renderComments = curry(
  function _renderComments(testMode, outputDir, x) {
    return chain(
      pipe(
        groupBy(propOr('unknown', testMode ? 'testPath' : 'workspace')),
        tap(xxx =>
          log.core(
            `grouped ${testMode ? 'tests' : 'comments'}...`,
            pipe(
              toPairs,
              map(
                ([k, y]) =>
                  `\n${k}:\n - ${pipe(
                    map(z => z.slugName),
                    join('\n - ')
                  )(y)}`
              ),
              join('\n')
            )(xxx)
          )
        ),
        writeCommentsToFiles({ testMode, outputDir })
      )
    )(x)
  }
)

export const processComments = curry(function _processComments(testMode, x) {
  return (testMode ? filterAndStructureTests : filterAndStructureComments)(x)
})
