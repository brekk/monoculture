import { argv } from 'process'
import { cli } from './digested'
import { fork } from 'fluture'

// eslint-disable-next-line no-console
fork(console.warn)(console.log)(cli(argv.slice(2)))
