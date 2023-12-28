import { __ as $, curry, pipe, chain, map, always as K } from 'ramda'

import { writeFileWithConfigAndCancel } from 'file-system'

import { DEFAULT_GRAPHVIZ_CONFIG } from './constants'
import { plant, familyTree } from './tree'
import { createSVG } from './visualization'

import { log } from './log'

export const bloodlineWithCancel = curry((cancel, config) => {
  const {
    graphvizConfig = DEFAULT_GRAPHVIZ_CONFIG,
    basePath,
    output: outputPath,
    input,
    tree = {},
    cache = {},
  } = config
  return pipe(
    pipe(log.cli('config'), plant($, basePath))(config),
    map(log.verbose('initial tree')),
    familyTree(input, config, tree, cache),
    log.cli('family'),
    createSVG(cancel, graphvizConfig, []),
    chain(writeFileWithConfigAndCancel(cancel, config, outputPath)),
    map(K(`Written to ${outputPath}`))
  )(input)
})
