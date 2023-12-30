import { complextrace } from 'envtrace'
export const log = complextrace('doctor-general', [
  'core',
  'comment',
  'config',
  'file',
  'parse',
  'renderer',
  'stats',
  'string',
  'text',
])
