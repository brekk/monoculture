import { runner } from './runner'
import { fork } from 'fluture'

// eslint-disable-next-line no-console
fork(console.warn)(console.log)(runner(() => {}, process.argv.slice(2)))
