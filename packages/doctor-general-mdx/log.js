import { complextrace } from 'envtrace'

export const log = complextrace('doctor-general-mdx', [
  'main',
  'doc',
  'meta',
  'read',
  'write',
  'renderer',
])
