import { cli } from './cli'
import { fork } from 'fluture'

// eslint-disable-next-line no-console
fork(console.error)(console.log)(cli(() => {}, process.argv))
