// import * as Q from 'remeda'
import { purry } from 'remeda'

interface Transformer<F, T> {
  (arg: F): T
}

/*
this higher-specificy TS version does nothing I can see
export function $equalishBy<F, T>(
  x: F,
  transform: Transformer<F, T>,
  expected: T
): boolean {
  // eslint-disable-next-line no-console
  console.log({ x, transform, expected })
  const t = transform(x)
  return t === expected
}
*/

export const $equalishBy = (x, transform, expected) => {
  // eslint-disable-next-line no-console
  const t = transform(x)
  return t === expected
}

export function equalishBy<F, T>(
  transform: Transformer<F, T>
): (expected: T, x: F) => boolean

export function equalishBy<F, T>(
  transform: Transformer<F, T>,
  expected: T
): (x: F) => boolean

export function equalishBy<F, T>(
  transform: Transformer<F, T>,
  expected: T,
  x: F
): boolean

// https://remedajs.com/docs#purry
export function equalishBy() {
  return purry($equalishBy, arguments)
}
