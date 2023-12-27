import { complextrace } from 'envtrace'
export const log = complextrace('digested', [
  'cli',
  'summary',
  'markdown',
  'link',
])
