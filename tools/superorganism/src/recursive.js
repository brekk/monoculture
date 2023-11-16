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

const mapSnd = curry((fn, [k, v]) => [k, fn(v)])
const I2 = curry((a, b) => b)

export const recurse = curry(
  (
    {
      pair: processPair = I2,
      field: processField = I2,
      list: processList = I2,
    },
    raw
  ) => {
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
  }
)
