import { interrogate, validate } from './interpreter'

test('interrogate', () => {
  const myCoolInterpreter = {
    output: () => {},
    group: '',
    process: () => {},
    postRender: (a, b) => b,
    renderer: (a, b) => b,
  }
  expect(interrogate({})).toEqual({
    additionalFieldCheck: {},
    additionalFields: [],
    meetsOptionalRequirements: false,
    meetsRequirements: false,
    incorrectFields: [
      'output',
      'group',
      'process',
      'renderer',
      'postRender',
      'postProcess',
    ],
    checked: {
      optional: { postProcess: false },
      required: {
        group: false,
        output: false,
        postRender: false,
        process: false,
        renderer: false,
      },
    },
  })
  expect(interrogate(myCoolInterpreter)).toEqual({
    additionalFieldCheck: {},
    additionalFields: [],
    meetsOptionalRequirements: false,
    meetsRequirements: true,
    incorrectFields: ['postProcess'],
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
  })
  expect(
    interrogate({
      ...myCoolInterpreter,
      postProcess: (a, b, c) => b,
    })
  ).toEqual({
    additionalFieldCheck: { postProcess: true },
    additionalFields: ['postProcess'],
    meetsOptionalRequirements: true,
    meetsRequirements: true,
    incorrectFields: [],
    checked: {
      optional: { postProcess: true },
      required: {
        group: true,
        output: true,
        postRender: true,
        process: true,
        renderer: true,
      },
    },
  })
  expect(
    interrogate({
      ...myCoolInterpreter,
      unsupportedFunction: (a, b) => b,
    })
  ).toEqual({
    additionalFieldCheck: { unsupportedFunction: false },
    additionalFields: ['unsupportedFunction'],
    meetsOptionalRequirements: false,
    meetsRequirements: true,
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
  })
})

test('validate', () => {
  const myCoolInterpreter = {
    output: () => {},
    group: '',
    process: () => {},
    postRender: (a, b) => b,
    renderer: (a, b) => b,
  }

  expect(validate({})).toBeFalsy()
  expect(validate(myCoolInterpreter)).toBeTruthy()
  expect(
    validate({
      ...myCoolInterpreter,
      postProcess: (a, b, __c) => b,
    })
  ).toBeTruthy()
  expect(
    validate({
      ...myCoolInterpreter,
      unsupportedFunction: (a, b) => b,
    })
  ).toBeFalsy()
})
