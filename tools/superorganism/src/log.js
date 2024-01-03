import { complextrace } from 'envtrace'
import PKG from '../package.json'

export const log = complextrace(PKG.name, ['info', 'config', 'io'])
