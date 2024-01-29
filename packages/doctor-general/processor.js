import {
  always as K,
  ifElse,
  equals,
  toPairs,
  reject,
  identity as I,
  map,
  fromPairs,
  values,
  without,
  includes,
  ap,
  keys,
  where,
  propOr,
  pipe,
  curry,
  length,
  is,
  isEmpty,
} from 'ramda'

const isFn = is(Function)

/**
 * Return the number of arguments a function expects
 * @name arity
 * @example
 * ```js test=true
 * expect(arity((a,b,c) => {})).toEqual(3)
 * expect(arity(function tertiary(a,b,c) {})).toEqual(3)
 * expect(arity(a => b => c => c)).toEqual(1)
 * expect(arity('poo')).toEqual(-1)
 */
export const arity = ifElse(isFn, length, K(-1))
export const arityOf = curry(function _arityOf(expected, fn) {
  return isFn(fn) && arity(fn) === expected
})

const REQUIREMENTS = {
  output: isFn,
  group: is(String),
  process: isFn,
  renderer: arityOf(2),
  postRender: arityOf(2),
}
const OPTIONAL = {
  postProcess: arityOf(3),
}
const UNMATCHED = Infinity

// whereWithContext is (I think?) a unary `applySpec`
export const whereWithContext = curry((spec, comp) =>
  pipe(
    toPairs,
    map(([k, fn]) => [
      k,
      pipe(
        // we can't shortcut this with `false` as a default
        propOr(UNMATCHED, k),
        ifElse(equals(UNMATCHED), K(false), fn)
      )(comp),
    ]),
    fromPairs
  )(spec)
)
export const required = where(REQUIREMENTS)
export const requiredWithContext = whereWithContext(REQUIREMENTS)
export const optional = where(OPTIONAL)
export const optionalWithContext = whereWithContext(OPTIONAL)

const REQUIRED_KEYS = keys(REQUIREMENTS)

export const OPTIONAL_KEYS = keys(OPTIONAL)
export const VALID_KEYS = [...REQUIRED_KEYS, ...OPTIONAL_KEYS]

/*
 * Apply tests to a given processor in order to assess its correctness.
 * @name interrogate
 * @exported
 */
export const interrogate = raw =>
  pipe(
    x => [x],
    ap([keys, required, optional, requiredWithContext, optionalWithContext]),
    function interrogation([
      k,
      meetsRequirements,
      meetsOptionalRequirements,
      checkedFields,
      checkedOptionalFields,
    ]) {
      const additionalFields = without(REQUIRED_KEYS)(k)
      const additionalFieldCheck = pipe(
        map(f => [f, includes(f, OPTIONAL_KEYS)]),
        fromPairs
      )(additionalFields)

      return {
        meetsRequirements,
        meetsOptionalRequirements,
        additionalFields,
        additionalFieldCheck,
        checked: {
          required: checkedFields,
          optional: checkedOptionalFields,
        },
        incorrectFields: pipe(
          reject(I),
          keys
        )({
          ...checkedFields,
          ...checkedOptionalFields,
        }),
      }
    }
  )(raw)

/**
 * Validate a given processor is correct.
 * If you want to see _why_ it is incorrect, use `interrogate` instead.
 * @name validate
 * @see {@link interrogate}
 * @exported
 */
export const validate = pipe(
  interrogate,
  function passFail({
    meetsOptionalRequirements,
    additionalFieldCheck,
    meetsRequirements,
  }) {
    const secondCheck = pipe(values, reject(I), isEmpty)(additionalFieldCheck)
    return meetsRequirements && (meetsOptionalRequirements || secondCheck)
  }
)
