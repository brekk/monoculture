import { complextrace } from 'envtrace'

export const log = complextrace('monocle', ['config', 'file', 'plugin'])
