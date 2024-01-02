import {
  allPass,
  tap,
  complement,
  is,
  curry,
  pipe,
  toPairs,
  map,
  fromPairs,
  T,
  cond,
} from 'ramda'

const isArray = Array.isArray
const isType = t => x => typeof x === t
const isObject = allPass([is(Object), complement(isArray), isType('object')])

const mapSnd = curry(function _mapSnd(fn, [k, v]) {
  return [k, fn(v)]
})
const I2 = curry(function _I2(a, b) {
  return b
})

export const recurse = curry(function _recurse(
  { pair: processPair = I2, field: processField = I2, list: processList = I2 },
  raw
) {
  function walk(steps) {
    return x =>
      cond([
        [isArray, map(pipe(processList(steps), walk(steps)))],
        [
          isObject,
          pipe(
            toPairs,
            map(pair => {
              const newSteps = [...steps]
              return pipe(
                tap(([k, v]) => {
                  newSteps.push(k)
                  return [k, v]
                }),
                processPair(newSteps),
                mapSnd(walk(newSteps))
              )(pair)
            }),
            fromPairs
          ),
        ],
        [T, processField(steps)],
      ])(x)
  }
  return walk([])(raw)
})
