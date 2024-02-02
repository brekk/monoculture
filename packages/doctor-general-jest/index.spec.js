import MAIN from './index'
import { validate, interrogate } from 'doctor-general'

test('doctor-general-jest is statically valid', () => {
  expect(validate(MAIN)).toBeTruthy()
  expect(interrogate(MAIN)).toEqual({
    additionalFieldCheck: {},
    additionalFields: [],
    checked: {
      optional: { postProcess: false },
      required: {
        group: true,
        output: true,
        postRender: true,
        process: true,
        renderer: true,
      },
    },
    incorrectFields: ['postProcess'],
    meetsRequirements: true,
    meetsOptionalRequirements: false,
  })
})
