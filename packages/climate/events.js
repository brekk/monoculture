import { identity as I } from 'ramda'

export const interrupt =
  (cleanup = I) =>
  () => {
    // TODO: add this later
    // const ctrl = new AbortController()
    process.on('SIGINT', function signalInterrupt() {
      const code = cleanup() || 0
      process.exit(code)
    })
  }
