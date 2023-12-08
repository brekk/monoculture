import __wrapAnsi from 'wrap-ansi'
import { Chalk } from 'chalk'
import __ansiAlign from 'ansi-align'
import widestLine from 'widest-line'
import strlen from 'string-length'
import { camelCase } from 'camel-case'
import { trace } from 'xtrace'
import {
  without,
  __ as $,
  identity as I,
  memoizeWith,
  repeat,
  unless,
  split,
  join,
  reduce,
  always as K,
  both,
  when,
  propOr,
  map,
  cond,
  curryN,
  equals,
  T,
  curry,
  pipe,
  mergeRight,
  ifElse,
} from 'ramda'

const ansiWrap = curryN(3, __wrapAnsi)
const ansiAlign = curryN(2, __ansiAlign)

const NEWLINE = '\n'
const lines = split(NEWLINE)
const unlines = join(NEWLINE)
const PAD = ' '
const NONE = 'none'

const terminalColumns = () => {
  const { env, stdout, stderr } = process
  return env.COLUMNS
    ? Number.parseInt(env.COLUMNS, 10)
    : stdout?.columns
    ? stdout.columns
    : stderr?.columns
    ? stderr.columns
    : 80
}

const isType = curry((y, x) => typeof x === y)

const objectify = ifElse(
  isType('number'),
  top => ({
    top,
    right: top * 3,
    bottom: top,
    left: top * 3,
  }),
  mergeRight({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  })
)

export const getBorderWidth = s => (s === NONE ? 0 : 2)

export const SIDES = [
  'topLeft',
  'topRight',
  'bottomRight',
  'bottomLeft',
  'left',
  'right',
  'top',
  'bottom',
]
export const isOdd = x => x % 2 === 1

export const makeTitle = curry((text, horizontal, alignment) => {
  const textWidth = strlen(text)
  return pipe(
    cond([
      [equals('left'), () => text + horizontal.slice(textWidth)],
      [equals('right'), () => horizontal.slice(textWidth) + text],
      [
        T,
        () => {
          horizontal = horizontal.slice(textWidth)

          if (isOdd(strlen(horizontal))) {
            // when length is odd
            horizontal = horizontal.slice(Math.floor(strlen(horizontal) / 2))
            return horizontal.slice(1) + text + horizontal
          } else {
            horizontal = horizontal.slice(strlen(horizontal) / 2)
            return horizontal + text + horizontal
          }
        },
      ],
    ])
  )(alignment)
})

export const enpad = curry(({ align, max, longest }, i) =>
  align === 'center'
    ? repad((max - longest) / 2) + i
    : align === 'right'
    ? repad(max - longest) + i
    : '' + i
)

const addNewLines = curry((max, align, lx) =>
  reduce(
    (newLines, line) => {
      const paddedLines = pipe(
        ansiWrap($, max, { hard: true }),
        ansiAlign($, { align }),
        lines,
        processedLines =>
          pipe(
            map(strlen),
            x => Math.max(...x),
            longest => map(enpad({ align, max, longest }))(processedLines)
          )(processedLines)
      )(line)

      return newLines.concat(paddedLines)
    },
    [],
    lx
  )
)
const realign = curry(({ max, textWidth }, align, linex) =>
  map(line =>
    align === 'center'
      ? repad((max - textWidth) / 2) + line
      : align === 'right'
      ? repad(max - textWidth) + line
      : line
  )(linex)
)

const makeContentText = (text, { padding, width, align, height }) => {
  text = ansiAlign(text, { align })
  let linex = text.split(NEWLINE)
  const textWidth = widestLine(text)

  const max = width - padding.left - padding.right

  linex =
    textWidth > max
      ? addNewLines(max, align, linex)
      : textWidth < max
      ? realign({ max, textWidth }, align, linex)
      : linex

  const [pl, pr] = map(repad)([padding.left, padding.right])

  linex = linex.map(line => {
    const l2 = pl + line + pr
    return l2 + repad(width - strlen(l2))
  })

  if (padding.top > 0) {
    linex = [
      ...Array.from({ length: padding.top }).fill(repad(width)),
      ...linex,
    ]
  }

  if (padding.bottom > 0) {
    linex = [
      ...linex,
      ...Array.from({ length: padding.bottom }).fill(repad(width)),
    ]
  }
  if (height) {
    if (linex.length > height) {
      linex = linex.slice(0, height)
    } else if (linex.length < height) {
      linex = [
        ...linex,
        ...Array.from({ length: height - linex.length }).fill(repad(width)),
      ]
    }
  }

  return linex.join(NEWLINE)
}

const colorizeBorder = curry((options, border) => {
  const { chalk } = options
  const newBorder = options.borderColor
    ? getColorFn(options.borderColor)(border)
    : border
  return options.dimBorder ? chalk.dim(newBorder) : newBorder
})

const colorizeContent = curry((options, content) =>
  options.backgroundColor
    ? getBGColorFn(options.chalk, options.backgroundColor)(content)
    : content
)
const minimumEdge = curry((field, ox) =>
  when(propOr(false, field), o => {
    o[field] = Math.max(1, o[field] - getBorderWidth(o.borderStyle))
    return o
  })(ox)
)

const sanitizeOptions = pipe(
  when(
    both(propOr(false, 'fullscreen'), () => process?.stdout),
    o => {
      const sto = process.stdout
      const rawDimensions = [sto.columns, sto.rows]

      const newDimensions = isType('function', o.fullscreen)
        ? o.fullscreen(rawDimensions)
        : rawDimensions
      const [cols, rows] = newDimensions

      if (!o.width) {
        o.width = cols
      }

      if (!o.height) {
        o.height = rows
      }
      return o
    }
  ),
  minimumEdge('width'),
  minimumEdge('height')
)

const formatWithPointer = curry(
  (char, selector, { [selector]: title, borderStyle, padTitle, chars }) =>
    borderStyle === NONE
      ? title
      : padTitle
      ? ` ${title} `
      : `${chars[char]}${title}${chars[char]}`
)

const formatTitle = formatWithPointer('top', 'title')
const formatSubTitle = formatWithPointer('bottom', 'subtitle')

const ensurePositive = z => (z < 0 ? 0 : z)

export const strepeat = toRepeat =>
  memoizeWith(I, n => pipe(ensurePositive, repeat(toRepeat), join(''))(n))

const repad = strepeat(PAD)

const getLeftMarginByAlignment = curry(
  (columns, contentWidth, { borderStyle, margin, float }) =>
    float === 'center'
      ? repad(
          Math.max(
            (columns - contentWidth - getBorderWidth(borderStyle)) / 2,
            0
          )
        )
      : float === 'right'
      ? repad(
          Math.max(
            columns - contentWidth - margin.right - getBorderWidth(borderStyle),
            0
          )
        )
      : repad(margin.left)
)
const reline = strepeat(NEWLINE)

const processContent = raw =>
  reduce(
    (agg, [pred, run]) =>
      ifElse(
        pred,
        pipe(run, y => agg + y),
        K(agg)
      )(raw),
    '',
    [
      [({ margin }) => margin.top, ({ margin }) => reline(margin.top)],
      [
        ({ borderStyle, title }) => borderStyle !== NONE || title,
        opts => {
          const { marginLeft, contentWidth, title, chars, align, titleAlign } =
            opts
          const retop = strepeat(chars.top)
          return (
            colorizeBorder(
              opts,
              marginLeft +
                chars.topLeft +
                (title
                  ? makeTitle(title, retop(contentWidth), titleAlign)
                  : retop(contentWidth)) +
                chars.topRight
            ) + NEWLINE
          )
        },
      ],
      [
        ({ content }) => lines(content).length > 0,
        opts => {
          const { marginLeft, chars, content } = opts
          return pipe(
            lines,
            map(
              line =>
                marginLeft +
                colorizeBorder(opts, chars.left) +
                colorizeContent(opts, line) +
                colorizeBorder(opts, chars.right)
            ),
            unlines,
            z => z + NEWLINE
          )(content)
        },
      ],
      [
        ({ subtitle, borderStyle }) => subtitle || borderStyle !== NONE,
        opts => {
          const {
            marginLeft,
            contentWidth,
            subtitle,
            chars,
            align,
            subtitleAlign,
          } = opts
          const rebottom = strepeat(chars.bottom)
          return colorizeBorder(
            opts,
            marginLeft +
              chars.bottomLeft +
              (subtitle
                ? makeTitle(subtitle, rebottom(contentWidth), subtitleAlign)
                : rebottom(contentWidth)) +
              chars.bottomRight
          )
        },
      ],
      [({ margin }) => margin.bottom, ({ margin }) => reline(margin.bottom)],
    ]
  )

const boxContent = (content, contentWidth, opts) => {
  const columns = terminalColumns()
  const marginLeft = getLeftMarginByAlignment(columns, contentWidth, opts)
  return processContent({ marginLeft, contentWidth, content, ...opts })
}

const noverflow = curry((what, dim, edges, opts) =>
  pipe(
    when(
      o => {
        const pads = reduce((agg, x) => agg + opts[what][x], 0, edges)
        return o[dim] - pads <= 0
      },
      o =>
        reduce(
          (agg, edge) => {
            agg[what][edge] = 0
            return agg
          },
          o,
          edges
        )
    )
  )(opts)
)
const noPaddingOverflow = noverflow('padding')

const handlePadding = pipe(
  noPaddingOverflow('width', ['left', 'right']),
  noPaddingOverflow('height', ['top', 'bottom'])
)
const retitle = curry((w, title, formatter, opts) => {
  const cut = Math.max(0, w - 2)
  return cut ? formatter(opts) : opts
})

const handleKeyedTitle = curry(
  (key, formatter, { maxWidth, widest }, adjustTitle, opts) => {
    const { [key]: title } = opts
    if (title) {
      if (adjustTitle) {
        opts[key] = retitle(opts.width, title, formatter, opts)
      } else {
        opts[key] = retitle(maxWidth, title, formatter, opts)
        if (strlen(opts[key]) > widest) {
          opts.width = strlen(opts[key])
        }
      }
    }
    return opts
  }
)
const handleTitle = handleKeyedTitle('title', formatTitle)
const handleSubTitle = handleKeyedTitle('subtitle', formatSubTitle)

const boundMargin = curry((m, x) =>
  pipe(Math.floor, z => Math.max(0, z))(x * m)
)

const handleMargin = curry(({ maxWidth, borderWidth, columns }, rewire, opts) =>
  unless(
    () => rewire,
    pipe(
      when(
        ({ margin, width }) => margin.left && margin.right && width > maxWidth,
        o => {
          const { width, margin } = o
          const spaceForMargins = columns - width - borderWidth
          const m = spaceForMargins / (margin.left + margin.right)
          const enmargin = boundMargin(m)
          o.margin.left = enmargin(margin.left)
          o.margin.right = enmargin(margin.right)
          return o
        }
      ),
      ({ width, margin, ...o }) => ({
        ...o,
        margin,
        width: Math.min(
          width,
          columns - borderWidth - margin.left - margin.right
        ),
      })
    )
  )(opts)
)

const size = curry((p, t) => widestLine(t) + p)

const determineDimensions = (text, opts) => {
  opts = sanitizeOptions(opts)
  const explicitWidth = !!opts.width
  const { margin, padding, title = '', subtitle = '' } = opts
  const columns = terminalColumns()
  const borderWidth = getBorderWidth(opts.borderStyle)
  const maxWidth = columns - margin.left - margin.right - borderWidth

  const sidepadding = padding.left + padding.right
  const wrapped = ansiWrap(text, columns - borderWidth, {
    hard: true,
    trim: false,
  })
  const sizes = map(size(sidepadding), [wrapped, title, subtitle])

  const _widest = Math.max(...sizes)
  const secondWidest = Math.max(...without([_widest], sizes))
  // TODO: this is kinda janky
  const widest = !opts.__autoSize__
    ? _widest
    : _widest - secondWidest <= borderWidth + 2
    ? secondWidest
    : _widest

  const dimensionalData = { maxWidth, borderWidth, columns, widest }

  return pipe(
    handleTitle(dimensionalData, explicitWidth),
    handleSubTitle(dimensionalData, explicitWidth),
    o => {
      o.width = o.width ? o.width : widest
      return o
    },
    handleMargin(dimensionalData, !explicitWidth),
    handlePadding
  )(opts)
}

export const isHex = color => color.match(/^#(?:[0-f]{3}){1,2}$/i)
export const isChalkColorValid = curry(
  (chalk, color) => typeof color === 'string' && (chalk[color] ?? isHex(color))
)
export const getColorFn = curry((chalk, color) =>
  isHex(color) ? chalk.hex(color) : chalk[color]
)
export const getBGColorFn = curry((chalk, color) =>
  isHex(color) ? chalk.bgHex(color) : chalk[camelCase(['bg', color])]
)

export const ensureValidColor = curry((chalk, key, color) => {
  if (color && !isChalkColorValid(chalk, color)) {
    throw new Error(`${color} is not a valid color (key: ${key})`)
  }
})
export const DEFAULT_OPTIONS = {
  color: true,
  padding: 0,
  borderStyle: 'single',
  dimBorder: false,
  float: 'left',
  align: 'left',
  titleAlign: 'left',
  subtitleAlign: 'left',
  chars: {
    top: '─',
    left: '│',
    right: '│',
    bottom: '─',
    topLeft: '╭',
    topRight: '╮',
    bottomLeft: '╰',
    bottomRight: '╯',
  },
  padTitle: false,
}

export const box = curry((opts, text) => {
  opts = mergeRight(DEFAULT_OPTIONS)(opts)

  const chalk = new Chalk({ level: opts.color ? 2 : 0 })
  opts.chalk = chalk

  ensureValidColor(chalk, 'borderColor', opts.borderColor)
  ensureValidColor(chalk, 'backgroundColor', opts.backgroundColor)

  opts.padding = objectify(opts.padding)
  opts.margin = objectify(opts.margin)

  opts = determineDimensions(text, opts)

  text = makeContentText(text, opts)

  return boxContent(text, opts.width, opts)
})
