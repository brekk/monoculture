import { curry } from 'ramda'
export const trace = curry((a, b) => {
  // eslint-disable-next-line no-console
  console.log(a, b)
  return b
})
