import { complextrace } from 'envtrace'
export const log = complextrace('monorail', [
  'helper',
  'validate',
  'sort',
  'route',
  'run',
])
