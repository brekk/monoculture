import { complextrace } from 'envtrace'
export const log = complextrace('file-system', ['exec', 'fs', 'future', 'path'])
