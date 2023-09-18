import { monodoc } from './cli'
import { fork } from 'fluture'

// fork it so it actually executes!
// eslint-disable-next-line no-console
fork(console.error)(console.log)(monodoc(process.argv))
