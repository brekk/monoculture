import { equalishBy } from './index'
import type { EqualishBy } from './ramda'
import { equalishBy as rBy } from './ramda'

const productIdSelector = (z: string): string => {
  const d = z.indexOf('-')
  return d > -1 ? z.slice(0, d) : 'NO_MATCH'
}

test('smoke test -- productIdSelector', () => {
  expect(productIdSelector('coolco-292929')).toEqual('coolco')
  expect(productIdSelector('2020202')).toEqual('NO_MATCH')
})
test('remeda -- equalishBy - no curry', () => {
  const isCoolProduct = equalishBy<string, string>(productIdSelector, 'coolco')
  // is this the best we can do today?
  const isApplicablyCool = (y: string) => equalishBy(productIdSelector, y)
  const isCoolProduct2 = isApplicablyCool('coolco')

  expect(isCoolProduct('coolco-292929')).toBeTruthy()
  expect(isCoolProduct('2020202')).toBeFalsy()

  expect(isCoolProduct2('coolco-292929')).toBeTruthy()
  expect(isCoolProduct2('2020202')).toBeFalsy()

  // this correctly yells about incorrect types
  // productIdSelector(/2/g)

  expect(equalishBy((a: string): string => a, 'coolco-101')).toBeTruthy()
})

test('remeda -- equalishBy - inline-type', () => {
  const isCoolProduct = equalishBy<string, string>(productIdSelector, 'coolco')
  // this doesn't work
  // const isApplicablyCool: EqualishBy<string, string> =
  //   equalishBy(productIdSelector)
  type FunType = (y: string) => EqualishBy<string, string>
  const isApplicablyCool: FunType = equalishBy(productIdSelector)
  const isCoolProduct2 = isApplicablyCool('coolco')

  expect(isCoolProduct('coolco-292929')).toBeTruthy()
  expect(isCoolProduct('2020202')).toBeFalsy()

  expect(isCoolProduct2('coolco-292929')).toBeTruthy()
  expect(isCoolProduct2('2020202')).toBeFalsy()

  expect(equalishBy((a: string): string => a, 'coolco-101')).toBeTruthy()
})

test('remeda -- equalishBy - curry', () => {
  const isCoolProduct = equalishBy<string, string>(productIdSelector, 'coolco')
  const isApplicablyCool = equalishBy(productIdSelector)
  // this fails TS
  const isCoolProduct2 = isApplicablyCool('coolco')

  expect(isCoolProduct('coolco-292929')).toBeTruthy()
  expect(isCoolProduct('2020202')).toBeFalsy()
  expect(isCoolProduct2('coolco-292929')).toBeTruthy()
  expect(isCoolProduct2('2020202')).toBeFalsy()

  // TS hates this
  // const yes = equalishBy((a: string): string => a)
  // expect(yes('coolco-101')).toBeTruthy()
  expect(equalishBy((a: string): string => a, 'coolco-101')).toBeTruthy()
})
test('ramda  -- equalishBy', () => {
  const selecto = rBy<string, string>(productIdSelector)
  const isCoolProduct = selecto('coolco')
  expect(isCoolProduct('coolco-292929')).toBeTruthy()
  expect(isCoolProduct('2020202')).toBeFalsy()
  const isNum = rBy<any, string>(x => typeof x, 'number')
  expect(isNum(20000)).toBeTruthy()
  expect(isNum('barf')).toBeFalsy()
  // currently doesn't barf without overloads
  // const hey = rBy<string, string>('test')
})

test('ramda  -- equalishBy - undeclared application', () => {
  const selecto: EqualishBy<string, string> = rBy(productIdSelector)
  const isCoolProduct = selecto('coolco')
  expect(isCoolProduct('coolco-292929')).toBeTruthy()
  expect(isCoolProduct('2020202')).toBeFalsy()
  const isNum: EqualishBy<any, string> = rBy(x => typeof x, 'number')
  expect(isNum(20000)).toBeTruthy()
  expect(isNum('barf')).toBeFalsy()
})
