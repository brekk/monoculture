import { cli } from './cli'
import { interrupt } from 'climate'
import { fork } from 'fluture'

const runner = () =>
  // eslint-disable-next-line no-console
  fork(console.error)(console.log)(cli(interrupt(), process.argv))

runner()
