import { box } from './box'

test('box', () => {
  expect(box).toBeTruthy()
  expect(box({}, 'cool!')).toEqual(`╭─────╮
│cool!│
╰─────╯`)
})

test('box w/ padding', () => {
  expect(box({ padding: 1 }, 'cool!')).toEqual(`╭───────────╮
│           │
│   cool!   │
│           │
╰───────────╯`)
})

test('box w/ title', () => {
  expect(
    box(
      { padding: 1, title: 'hey now', padTitle: true, __autoSize__: true },
      'nice!'
    )
  ).toEqual(`╭ hey now ──╮
│           │
│   nice!   │
│           │
╰───────────╯`)
})

test('box w/ title no pad title', () => {
  expect(box({ padding: 1, title: 'hey now' }, 'nice!'))
    .toEqual(`╭─hey now─────╮
│             │
│   nice!     │
│             │
╰─────────────╯`)
})

test('box w/ subtitle ', () => {
  expect(box({ padding: 1, subtitle: 'hey now', __autoSize__: true }, 'nice!'))
    .toEqual(`╭───────────╮
│           │
│   nice!   │
│           │
╰─hey now───╯`)
})

test('box w/ loooooooong subtitle ', () => {
  expect(box({ padding: 1, subtitle: 'hey now, remember to be kind' }, 'nice!'))
    .toEqual(`╭──────────────────────────────────╮
│                                  │
│   nice!                          │
│                                  │
╰─hey now, remember to be kind─────╯`)
})

/* eslint-disable max-length */
test('box w/ lots of content', () => {
  expect(
    box(
      {
        padding: 1,
        titleAlignment: 'right',
        title: 'mega awesome shit butts',
        subtitle: 'hey now, remember to be kind',
      },
      `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris augue dui, lacinia ut nulla sit amet, fermentum sagittis elit. Aenean velit neque, ornare eu nisl quis, elementum dignissim mi.\n\n\nNunc ac mi porta, sodales massa eu, mattis velit. Cras ac porta tortor. Donec dapibus eu mi id egestas. Nullam rhoncus dolor risus, et tincidunt massa pharetra ut. Fusce at imperdiet mauris. Donec convallis, enim sit amet commodo tempor, arcu libero aliquam elit, sit amet vestibulum nisi nulla quis dolor. Duis vel efficitur mi. Nullam et faucibus risus. Vestibulum tempus urna ligula, nec accumsan elit efficitur sit amet. Donec tristique, massa nec feugiat ullamcorper, turpis risus egestas velit, et imperdiet lacus ipsum id justo.`
    )
  )
    .toEqual(`╭─mega awesome shit butts────────────────────────────────────────────────────────────╮
│                                                                                    │
│   Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris augue dui,       │
│   lacinia ut nulla sit amet, fermentum sagittis elit. Aenean velit neque, ornare   │
│   eu nisl quis, elementum dignissim mi.                                            │
│                                                                                    │
│                                                                                    │
│   Nunc ac mi porta, sodales massa eu, mattis velit. Cras ac porta tortor. Donec    │
│   dapibus eu mi id egestas. Nullam rhoncus dolor risus, et tincidunt massa         │
│   pharetra ut. Fusce at imperdiet mauris. Donec convallis, enim sit amet commodo   │
│   tempor, arcu libero aliquam elit, sit amet vestibulum nisi nulla quis dolor.     │
│   Duis vel efficitur mi. Nullam et faucibus risus. Vestibulum tempus urna          │
│   ligula, nec accumsan elit efficitur sit amet. Donec tristique, massa nec         │
│   feugiat ullamcorper, turpis risus egestas velit, et imperdiet lacus ipsum id     │
│   justo.                                                                           │
│                                                                                    │
╰─hey now, remember to be kind───────────────────────────────────────────────────────╯`)
})

test('box with long title and small content', () => {
  const out = box(
    {
      title: '01234567890123456789012',
      subtitle: ' A  P ─┴─ T  C',
    },
    'more tests'
  )
  expect(out).toEqual(`╭─01234567890123456789012─╮
│more tests               │
╰─ A  P ─┴─ T  C──────────╯`)
})
