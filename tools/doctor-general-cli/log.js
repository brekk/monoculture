import { complextrace } from 'envtrace'
export const log = complextrace('doctor-general', [
  'cli',
  'parse',
  'render',
  'stats',
  'verbose',
])
