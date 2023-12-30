import { complextrace } from 'envtrace'
export const log = complextrace('doctor-general', [
  'core',
  'parse',
  'render',
  'stats',
  'verbose',
])
