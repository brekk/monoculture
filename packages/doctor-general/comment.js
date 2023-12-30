import { extname, basename, dirname, join as pathJoin } from 'node:path'
import { capitalToKebab, stripLeadingHyphen } from './string'
import { isNotEmpty } from 'inherent'
import { TESTABLE_EXAMPLE } from './constants'
import {
  includes,
  prop,
  __ as $,
  addIndex,
  always as K,
  any,
  anyPass,
  applySpec,
  chain,
  cond,
  curry,
  defaultTo,
  either,
  equals,
  filter,
  findIndex,
  fromPairs,
  head,
  identity as I,
  ifElse,
  isEmpty,
  last,
  length,
  map,
  match,
  path,
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
  toLower,
  toPairs,
  trim,
  uniq,
} from 'ramda'
import { findJSDocKeywords, cleanupKeywords } from './file'
import {
  unlines,
  formatComment,
  trimComment,
  wipeComment,
  stripRelative,
} from './text'

const linkRegex = /\{@link (.*)+\}/g
export const matchLinks = pipe(
  chain(match(linkRegex)),
  map(z => slice('{@link '.length, z.length - 1, z))
)
const ORDERED_LIST_ITEM = /^\s\d*\.\s/g
const CURRIED_LIST_ITEM = /^\d+\.\s(\w+)\s-\s(.*)/g
const isListItem = testRegExp(ORDERED_LIST_ITEM)

export const getCurriedDefinition = curry((file, end, i) => {
  return pipe(
    slice(i + 1, end),
    map(trimComment),
    map(replace(/^\*$/g, '')),
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
})

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
export const structureKeywords = curry((file, block, end) =>
  pipe(
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

export const slug = name => {
  const slashPlus = name.lastIndexOf('/') + 1
  return name.indexOf('.') > -1
    ? name.slice(slashPlus, name.indexOf('.'))
    : name.slice(slashPlus)
}

// getFileGroup :: String -> Comment
const getFileGroup = propOr('', 'group')
const addTo = propOr('', 'addTo')

// objectifyComments :: Boolean -> String -> List Comment -> List CommentBlock
export const objectifyComments = curry((filename, file, comments) =>
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
)

// getExample :: List String -> Integer -> Integer -> String
export const getExample = curry((file, end, i) =>
  pipe(
    slice(i + 1, end),
    map(trimComment),
    map(replace(/^\*$/g, '')),
    unlines
  )(file)
)

// isJSDocComment :: String -> Boolean
export const isJSDocComment = pipe(
  trim,
  anyPass([startsWith('/**'), startsWith('*'), startsWith('*/')])
)

export const combineFiles = curry((leftToRight, a, b) =>
  !leftToRight
    ? combineFiles(true, b, a)
    : {
        ...a,
        ...b,
        comments: [...a.comments, ...b.comments],
        links: [...a.links, ...b.links],
      }
)

export const parsePackageName = y => {
  const slash = y.indexOf('/')
  const start = slash + 1
  const end = y.indexOf('/', start)
  return y.slice(start, end)
}

export const filterAndStructureComments = pipe(
  filter(pipe(propOr([], 'comments'), isEmpty)),
  map(raw => {
    const filename = stripRelative(raw.filename)
    return {
      ...raw,
      comments: raw.comments.map(r => ({ ...r, filename })),
      filename,
      workspace: parsePackageName(filename),
    }
  }),
  reduce((agg, file) => {
    const filenames = map(prop('filename'), agg)
    const alreadyInList = filenames.includes(file.filename)
    const anyFile = file.comments.filter(({ structure }) => structure.asFile)
    const someFile = anyFile.length > 0 ? anyFile[0] : false
    const asFilePath = pipe(
      defaultTo({}),
      pathOr('???', ['structure', 'asFile'])
    )(someFile)
    const withOrder = pipe(pathOr('0', ['structure', 'order']), x =>
      parseInt(x, 10)
    )(someFile)
    const dir = dirname(file.filename)
    const newFile = someFile ? pathJoin(dir, asFilePath) : '???'
    return alreadyInList
      ? map(raw => {
          const check = raw.filename === file.filename
          return check ? combineFiles(raw.order < withOrder, raw, file) : raw
        })(agg)
      : [
          ...agg,
          someFile
            ? {
                ...file,
                filename: newFile,
                order: withOrder,
                originalFilename: file.filename,
              }
            : file,
        ]
  }, [])
)

export const hasTestableExample = pipe(
  pathOr('', ['structure', 'example']),
  includes(TESTABLE_EXAMPLE)
)
export const filterAndStructureTests = pipe(
  filter(pipe(propOr([], 'comments'), filter(hasTestableExample), isNotEmpty)),
  map(raw => {
    const filename = stripRelative(raw.filename)
    const ext = extname(filename)
    return {
      ...raw,
      comments: raw.comments.map(r => ({ ...r, filename })),
      filename,
      testPath: `${basename(filename, ext)}.spec${ext}`,
    }
  }),
  reduce((agg, file) => {
    const filenames = map(prop('filename'), agg)
    const alreadyInList = filenames.includes(file.filename)
    const anyFile = file.comments.filter(({ structure }) => structure.asFile)
    const someFile = anyFile.length > 0 ? anyFile[0] : false
    const asFilePath = pipe(
      defaultTo({}),
      pathOr('???', ['structure', 'asFile'])
    )(someFile)
    const withOrder = pipe(pathOr('0', ['structure', 'order']), x =>
      parseInt(x, 10)
    )(someFile)
    const dir = dirname(file.filename)
    const newFile = someFile ? pathJoin(dir, asFilePath) : '???'
    return alreadyInList
      ? map(raw => {
          const check = raw.filename === file.filename
          return check ? combineFiles(raw.order < withOrder, raw, file) : raw
        })(agg)
      : [
          ...agg,
          someFile
            ? {
                ...file,
                filename: newFile,
                order: withOrder,
                originalFilename: file.filename,
              }
            : file,
        ]
  }, [])
)

export const pullPageTitleFromAnyComment = pipe(
  filter(pathOr(false, ['structure', 'page'])),
  map(path(['structure', 'page'])),
  head,
  defaultTo(''),
  replace(/\s/g, '-'),
  defaultTo(false)
)

export const cleanFilename = curry(
  (testMode, { fileGroup, filename, comments }) => {
    const title = pullPageTitleFromAnyComment(comments)
    const sliced = title || slug(filename)
    const result = toLower(capitalToKebab(sliced)) + '.mdx'
    return testMode
      ? ''
      : stripLeadingHyphen((fileGroup ? fileGroup + '/' : '') + result)
  }
)
