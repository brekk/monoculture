import { map, pipe } from 'ramda'
import { fork } from 'fluture'

import { gitgraph, renderTree } from './index'

// move this later
const runner = pipe(
  gitgraph(() => {}),
  map(renderTree)
)

// eslint-disable-next-line no-console
fork(console.warn)(console.log)(runner(process.argv.slice(2)))
