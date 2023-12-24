import * as Q from 'remeda'

interface Transformer {
  <F, T>(arg: F): T
}

function _equalishBy<F, T>(transform: Transformer, expected: T, x: F) {
  return transform(x) === expected
}

export function equalishBy() {
  return Q.purry(_equalishBy, arguments)
}

// console.log('>>>', Q.keys(Q))

const MICROPLASTIC = { equalishBy }

export default MICROPLASTIC
