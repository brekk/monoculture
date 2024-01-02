import { Buffer } from 'node:buffer'
import { log } from './log'
import {
  chain,
  map,
  mergeLeft,
  mergeRight,
  __ as $,
  forEach,
  keys,
  concat,
  pipe,
  reduce,
  curry,
} from 'ramda'
import { Future } from 'fluture'
import { digraph, toDot } from 'ts-graphviz'
import { toStream } from 'ts-graphviz/adapter'
import { isNotEmpty } from 'inherent'

import { waterWheel } from 'water-wheel'

import { DEFAULT_GRAPHVIZ_CONFIG } from './constants'

export const dotStreamAdapterWithCancel = curry(
  function _dotStreamAdapterWithCancel(cancel, options, dot) {
    return Future((bad, good) => {
      toStream(dot, options).catch(bad).then(good)
      return cancel
    })
  }
)

export const setAttribute = curry(function _setAttribute(key, node, x) {
  node.attributes.set(key, x)
  return node
})
export const setColor = setAttribute('color')

export const getCyclic = reduce((a, b) => concat(a, b), [])
export const createGraph = curry(
  (cancel, config, circular, options, modules) => {
    const { fontname } = config
    const $g = digraph('G', { fontname })
    const cyclic = getCyclic(circular)
    const { nodeColor, colors = DEFAULT_GRAPHVIZ_CONFIG.colors } = config
    const { noDependency: colorNoDependency, cyclical: colorCyclical } = colors
    const nodes = {}
    pipe(
      keys,
      forEach(id => {
        const hasChildren = isNotEmpty(modules[id])
        nodes[id] =
          nodes?.[id] ??
          $g.createNode(id, {
            fontname,
            color: nodeColor,
          })
        log.viz('|>', id)
        const colorize = setColor(nodes[id])
        if (!hasChildren) {
          colorize(colorNoDependency)
        } else if (cyclic.indexOf(id) >= 0) {
          colorize(colorCyclical)
        }

        forEach(depId => {
          log.viz('|->', depId)
          const hasSubChildren = isNotEmpty(modules[depId])
          nodes[depId] =
            nodes?.[depId] ??
            $g.createNode(depId, {
              fontname,
              color: nodeColor,
            })

          const colorizeSub = setColor(nodes[depId])

          if (!hasSubChildren) {
            colorizeSub(colorNoDependency)
          } else {
            log.viz(`|-<>`, '')
          }
          $g.createEdge([nodes[id], nodes[depId]])
        }, modules[id])
      })
    )(modules)
    return pipe(
      toDot,
      log.dot('generated'),
      dotStreamAdapterWithCancel(cancel, options),
      chain(pipe(waterWheel(cancel), map(pipe(Buffer.concat))))
    )($g)
  }
)

export const generateOptions = config => {
  const {
    shape,
    style,
    edgeColor,
    fontsize,
    nodeColor,
    fontname,
    rankdir,
    layout,
    bgcolor,
    graphviz = {},
  } = mergeRight(DEFAULT_GRAPHVIZ_CONFIG, config)
  const { options, path: dotCommand } = graphviz
  return {
    dotCommand,
    attributes: {
      // Graph
      graph: mergeRight(
        {
          bgcolor,
          layout,
          overlap: false,
          pad: 0.3,
          rankdir,
        },
        options?.graph ?? {}
      ),
      // Edge
      edge: mergeRight(
        {
          color: edgeColor,
        },
        options?.edge ?? {}
      ),
      // Node
      node: mergeRight(
        {
          color: nodeColor,
          fontcolor: nodeColor,
          fontname,
          fontsize,
          height: 0,
          shape,
          style,
        },
        options?.node ?? {}
      ),
    },
  }
}
export const createSVG = curry(
  function _createSVG(cancel, config, circular, modules) {
    return pipe(
      generateOptions,
      mergeLeft({ format: 'svg' }),
      log.viz('createSVG options'),
      createGraph(cancel, config, circular, $, modules)
    )(config)
  }
)
