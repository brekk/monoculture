import { complextrace } from 'envtrace'
export const log = complextrace('monorail', [
  'async',
  'validate',
  'sort',
  'route',
  'run',
])
