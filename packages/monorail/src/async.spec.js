import { curry, pipe, chain, __ as $ } from 'ramda'
import {
  cancellableTask,
  cancelSilently,
  unaryWithCancel,
  binaryWithCancel,
  tertiaryWithCancel,
} from './async'
import { after, fork } from 'fluture'
import Unusual from 'unusual'
import PKG from '../package.json'

const u = Unusual(PKG.name + '@' + PKG.version)

const double = z => z * 2

const xWithRandomDelay = curry((x, fn, args) =>
  pipe(
    fn(cancelSilently, x),
    chain(after(u.integer({ min: 1, max: 7 }) * 100))
  )(args)
)

test('cancellableTask - good', done => {
  const x = u.integer({ min: 0, max: 100 })
  fork(done)(y => {
    expect(y / 2).toEqual(x)
    done()
  })(xWithRandomDelay(double, cancellableTask, [x]))
})
test('cancellableTask - bad', done => {
  const x = u.integer({ min: 0, max: 100 })
  fork(y => {
    expect(y.message).toEqual(`ell ${x} barfo`)
    done()
  })(done)(
    xWithRandomDelay(
      () => {
        throw new Error(`ell ${x} barfo`)
      },
      cancellableTask,
      [x]
    )
  )
})
test('cancelSilently', () => {
  expect(cancelSilently()).toBeFalsy()
})

test('unaryWithCancel - good', done => {
  const x = u.integer({ min: 0, max: 100 })
  fork(done)(y => {
    expect(y / 2).toEqual(x)
    done()
  })(xWithRandomDelay(double, unaryWithCancel, x))
})

test('binaryWithCancel - good', done => {
  const x = u.integer({ min: 0, max: 100 })
  const divvy = (d, n) => n / d
  pipe(
    fork(done)(y => {
      expect(x / 2).toEqual(y)
      done()
    })
  )(xWithRandomDelay(divvy, binaryWithCancel($, $, 2), x))
})

test('tertiaryWithCancel - good', done => {
  const x = u.integer({ min: 0, max: 100 })
  const matho = (a, d, n) => (a * n) / d
  pipe(
    fork(done)(y => {
      expect((100 * x) / 3).toEqual(y)
      done()
    })
  )(xWithRandomDelay(matho, tertiaryWithCancel($, $, 100, 3), x))
})
