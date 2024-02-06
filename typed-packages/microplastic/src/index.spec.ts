import { equalishBy } from './index'
import type { EqualishBy } from './ramda'
import { equalishBy as rBy } from './ramda'

const productIdSelector = (z: string): string => {
  const d = z.indexOf('-')
  return d > -1 ? z.slice(0, d) : 'NO_MATCH'
}

test('remeda -- equalishBy', () => {
  const isCoolProduct = equalishBy<string, string>(productIdSelector, 'coolco')
  // THIS WORKS, BUT IS TYPICAL TS SLOP
  // const isApplicablyCool = (y: string) => equalishBy(productIdSelector, y)
  const isApplicablyCool = equalishBy(productIdSelector)
  // TS is sad:
  const isCoolProduct2 = isApplicablyCool('coolco')
  expect(productIdSelector('coolco-292929')).toEqual('coolco')
  expect(productIdSelector('2020202')).toEqual('NO_MATCH')

  expect(isCoolProduct('coolco-292929')).toBeTruthy()
  expect(isCoolProduct('2020202')).toBeFalsy()

  expect(isCoolProduct2('coolco-292929')).toBeTruthy()
  expect(isCoolProduct2('2020202')).toBeFalsy()

  // this correctly yells about incorrect types
  // productIdSelector(/2/g)
})
/* eslint-disable no-console */
test('ramda -- equalishBy', () => {
  console.log(rBy, typeof rBy)
  const selecto: EqualishBy<string, string> = rBy<string, string>(
    productIdSelector
  )
  console.log('selecto', selecto)
  const isCoolProduct = selecto('coolco')
  console.log('isCoolProduct', isCoolProduct)
  expect(isCoolProduct('coolco-292929')).toBeTruthy()
  expect(isCoolProduct('2020202')).toBeFalsy()
  const isNum = rBy<any, string>(x => typeof x, 'number')
  expect(isNum(20000)).toBeTruthy()
  expect(isNum('barf')).toBeFalsy()
  // currently doesn't barf without overloads
  // const hey = rBy<string, string>('test')
})
