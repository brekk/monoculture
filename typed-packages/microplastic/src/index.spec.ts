import { equalishBy } from './index'
import type { EqualishBy } from './ramda'
import { equalishBy as rBy } from './ramda'

const productIdSelector = (z: string): string => {
  console.log('Z', z)
  const d = z.indexOf('-')
  return d > -1 ? z.slice(0, d) : 'NO_MATCH'
}

test('equalishBy', () => {
  const isCoolProduct = equalishBy<string, string>(productIdSelector, 'coolco')
  expect(isCoolProduct('coolco-292929')).toBeTruthy()
  expect(productIdSelector('coolco-292929')).toEqual('coolco')
  expect(isCoolProduct('2020202')).toBeFalsy()
  expect(productIdSelector('2020202')).toEqual('NO_MATCH')
  // this correctly yells about incorrect types
  // productIdSelector(/2/g)
})

test('rBy', () => {
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
