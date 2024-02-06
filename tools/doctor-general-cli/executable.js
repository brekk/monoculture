import { cli } from './cli'
import { interrupt } from 'climate'
import { fork } from 'fluture'

const runner = () => cli(interrupt(), process.argv)

// eslint-disable-next-line no-console
fork(console.error)(console.log)(runner())
