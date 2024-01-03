import { Future } from 'fluture'
import { pipe } from 'ramda'

const handleDefault = rawPlug => {
  // TODO: this must be an upstream bug
  const out = rawPlug?.default?.default
    ? rawPlug.default.default
    : rawPlug?.default
      ? rawPlug.default
      : rawPlug
  return out
}

export const interpret = filepath =>
  Future((bad, good) => {
    import(filepath).catch(bad).then(pipe(handleDefault, good))
    return () => {}
  })
