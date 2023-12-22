import {
  equalishBy,
  ofType,
  isType,
  isObject,
  isString,
  isNumber,
  isBoolean,
  isUndefined,
  isArray,
  wrap,
  autobox,
  fresh,
  neue,
  manyNew,
} from './inherent'

const productIdSelector = z => {
  const d = z.indexOf('-')
  return d > -1 ? z.slice(0, d) : 'NO_MATCH'
}

test('equalishBy', () => {
  expect(equalishBy).toBeTruthy()

  const isProduct = equalishBy(productIdSelector, 'coolco')
  expect(isProduct('coolco-10020')).toBeTruthy()
  expect(isProduct('otherco-39292')).toBeFalsy()
  expect(isProduct('>===||=>')).toBeFalsy()
})
test('ofType', () => {
  expect(ofType).toBeTruthy()
  expect(ofType(100)).toEqual('number')
})
test('isType', () => {
  expect(isType).toBeTruthy()
  expect(isType('number', 1000)).toBeTruthy()
})
test('isObject', () => {
  expect(isObject).toBeTruthy()
})
test('isString', () => {
  expect(isString).toBeTruthy()
})
test('isNumber', () => {
  expect(isNumber).toBeTruthy()
})
test('isBoolean', () => {
  expect(isBoolean).toBeTruthy()
})
test('isUndefined', () => {
  expect(isUndefined).toBeTruthy()
})
test('isArray', () => {
  expect(isArray).toBeTruthy()
})

// array

test('wrap', () => {
  expect(wrap).toBeTruthy()
  expect(wrap(1)).toEqual([1])
  expect(wrap(wrap(1))).toEqual([[1]])
})
test('autobox', () => {
  expect(autobox).toBeTruthy()
  expect(autobox(1)).toEqual([1])
  expect(autobox(autobox(1))).toEqual([1])
})
test('fresh', () => {
  const arr = [1, 2, 3, 4, 5]
  const copy = arr
  const freshCopy = fresh(arr)
  expect(copy).toEqual(arr)
  copy.push(6)
  expect(arr).toEqual([1, 2, 3, 4, 5, 6])
  expect(freshCopy).toEqual([1, 2, 3, 4, 5])
})

// object

test('neue', () => {
  expect(neue).toBeTruthy()

  const obj = {
    a: {
      b: {
        c: {
          d: 'nice',
        },
      },
    },
    e: 1234,
  }

  const copy = obj
  const newCopy = neue(obj)
  copy.e = 5678
  expect(obj.e).toEqual(5678)
  expect(newCopy.e).toEqual(1234)
})
test('manyNew', () => {
  expect(manyNew).toBeTruthy()
  const obj = {
    a: {
      b: {
        c: {
          d: 'nice',
        },
      },
    },
    e: 1234,
  }
  const obj2 = {
    f: {
      g: {
        h: {
          i: 'cool',
        },
      },
    },
    j: 9999,
  }
  expect(manyNew([obj, obj2])).toEqual({ ...obj, ...obj2 })
})
