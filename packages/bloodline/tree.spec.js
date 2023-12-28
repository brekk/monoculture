import {
  getId,
  groupTree,
  plant,
  flattenTree,
  rootedPlant,
  familyTree,
} from './tree'
// import { sep as SEP } from 'node:path'
// import { nthIndex } from 'knot'

const tree = plant({}, '../..', '../monocle/cli.js')
const sharedConfig = { basePath: '../../../', includeNpm: true }
const rooted = rootedPlant(
  { ...sharedConfig, includeNpm: false },
  '../..',
  '../monocle/cli.js'
)
const rootedWithNpm = rootedPlant(sharedConfig, '../..', '../monocle/cli.js')

test('getId', () => {
  expect(getId('..', {}, 'a')).toEqual('bloodline/a')
})

test('groupTree', () => {
  const pFlatTree = groupTree(sharedConfig, {}, {}, tree)
  expect(pFlatTree).toMatchSnapshot()
})

test('groupTree - rooted', () => {
  const pFlatTree = groupTree(sharedConfig, {}, {}, rooted)
  expect(pFlatTree).toMatchSnapshot()
})
test('groupTree - rooted with npm', () => {
  const pFlatTree = groupTree(sharedConfig, {}, {}, rootedWithNpm)
  expect(pFlatTree).toMatchSnapshot()
})

test('flattenTree', () => {
  const flatTree = flattenTree(sharedConfig, {}, {}, tree)
  expect(flatTree).toMatchSnapshot()
})

test('familyTree', () => {
  const family = familyTree(sharedConfig, {}, {}, tree)
  expect(family).toMatchSnapshot()
})
