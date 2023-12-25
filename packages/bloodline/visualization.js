import { Buffer } from 'node:buffer'
import { log } from './log'
import {
  map,
  mergeLeft,
  mergeRight,
  __ as $,
  isEmpty,
  forEach,
  complement,
  keys,
  concat,
  pipe,
  reduce,
  curry,
} from 'ramda'
import { Future } from 'fluture'
import gv from 'ts-graphviz'
import adapter from 'ts-graphviz/adapter'

import { waterWheel } from 'water-wheel'

import { DEFAULT_GRAPHVIZ_CONFIG } from './constants'

export const dotStreamAdapterWithCancel = curry((cancel, options, dot) =>
  Future((bad, good) => {
    adapter.toStream(dot, options).catch(bad).then(good)
    return cancel
  })
)

export const isNotEmpty = complement(isEmpty)

export const setAttribute = curry((key, node, x) => {
  node.attributes.set(key, x)
  return node
})
export const setColor = setAttribute('color')

export const getCyclic = reduce((a, b) => concat(a, b), [])
export const createGraph = curry(
  (cancel, config, circular, options, modules) => {
    const $g = gv.digraph('G')
    const cyclic = getCyclic(circular)
    const { colors = DEFAULT_GRAPHVIZ_CONFIG.colors } = config
    const { noDependency: colorNoDependency, cyclical: colorCyclical } = colors
    const nodes = {}
    pipe(
      keys,
      forEach(id => {
        const $node = nodes?.[id] ?? $g.createNode(id)
        log.viz('processing...', id)
        const colorize = setColor($node)
        if (isNotEmpty(modules[id])) {
          colorize(colorNoDependency)
        } else if (cyclic.indexOf(id) >= 0) {
          colorize(colorCyclical)
        }

        forEach(depId => {
          log.viz('children...', depId)
          const $dep = nodes?.[depId] ?? $g.createNode(depId)
          nodes[depId] = $dep
          const colorizeSub = setColor($dep)
          if (!modules[depId]) {
            colorizeSub(colorNoDependency)
          }
          nodes[depId] = $dep
          $g.createEdge([$node, $dep])
        }, modules[id])
        nodes[id] = $node
      })
    )(modules)
    return pipe(
      gv.toDot,
      dotStreamAdapterWithCancel(cancel, options),
      waterWheel(cancel),
      map(Buffer.concat)
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
export const createSVG = curry((cancel, config, circular, modules) =>
  pipe(
    generateOptions,
    mergeLeft({ format: 'svg' }),
    log.viz('createSVG options'),
    createGraph(cancel, config, circular, $, modules)
  )(config)
)
