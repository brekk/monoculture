// import * as Q from 'remeda'
import { purry } from 'remeda'

interface Transformer<F, T> {
  (arg: F): T
}

export const $equalishBy = (x, transform, expected) => {
  console.log({ x, transform, expected })
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

export function equalishBy() {
  return purry($equalishBy, arguments)
}
