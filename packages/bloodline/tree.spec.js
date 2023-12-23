import { plant, flattenTree } from './tree'
// import { sep as SEP } from 'node:path'
// import { nthIndex } from 'knot'

const CWD = process.cwd()

const MONO = 'monoculture'
// TODO: this is kinda hacky but it works for now
const enclean = x =>
  x.indexOf(MONO) > -1 ? x.slice(x.indexOf(MONO) + MONO.length + 1) : x

test('flattenTree', () => {
  expect(plant).toBeTruthy()
  const tree = plant({}, '../..', '../monocle/cli.js')
  const flatTree = flattenTree({ basePath: '../../../' }, {}, {}, tree)
  expect(flatTree).toMatchSnapshot()
})
