import { equalishBy } from './index'
import { startsWith } from 'ramda'

const productIdSelector = (z: string): string => {
  const d = z.indexOf('-')
  return d > -1 ? z.slice(0, d) : 'NO_MATCH'
}

test('equalishBy', () => {
  const isCoolProduct = equalishBy<string, string>(productIdSelector, 'coolco')
  expect(isCoolProduct('coolco-292929')).toBeTruthy()
  expect(isCoolProduct('2020202')).toBeFalsy()
})
