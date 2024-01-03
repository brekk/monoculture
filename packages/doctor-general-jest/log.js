import { complextrace } from 'envtrace'

export const log = complextrace('doctor-general-jest', [
  'read',
  'write',
  'verbose',
  'renderer',
  'curried',
])
