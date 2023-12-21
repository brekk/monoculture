import { gitgraph, parser, renderTree } from './index'
import { findIndex, pipe } from 'ramda'
import { fork } from 'fluture'
const commitIs = commit => c => c.commit === commit
const START = '4f93946'
const END = '8466daa'

test('gitgraph', done => {
  fork(done)(
    pipe(data => {
      if (data.length === 1) {
        expect('This is a CI run!').toBeTruthy()
        return
      }
      const a = findIndex(commitIs(START))(data)
      const z = findIndex(commitIs(END))(data)
      expect(data.slice(a, z).map(y => y.commit)).toEqual([
        '4f93946',
        '80bb087',
        '3da2ea5',
        'bd7e964',
        'a6394fd',
        '6484cc8',
        '9872fad',
        '2e21cd7',
        'a501c3a',
        'f42a0cb',
        '25a5561',
        'b718431',
      ])
      done()
    })
  )(gitgraph(() => {}, ['-n', '10000']))
})

test('renderTree', done => {
  fork(done)(data => {
    if (data.length === 1) {
      expect('This is a CI run!').toBeTruthy()
      return
    }
    const a = findIndex(commitIs(START))(data)
    const z = findIndex(commitIs(END))(data)
    expect(renderTree(data.slice(a, z))).toEqual(`* 4f93946
* 80bb087
* 3da2ea5
* bd7e964
* a6394fd
* 6484cc8
* 9872fad
* 2e21cd7
* a501c3a
* f42a0cb
* 25a5561
* b718431`)
    done()
  })(gitgraph(() => {}, ['-n', '10000']))
})

test('parser', () => {
  const EXAMPLE = `*   a3b2eca Merge pull request #18 from open-sorcerers/add-code-of-conduct-1
|\\
| * 3584389 add code of conduct
|/
*   4567b6a Merge pull request #13 from open-sorcerers/prep-for-js-mondays
|\\
| * b64af6c commit before you break it
| * f33c9ae add gist styles
| * ebf7816 Added a Reveal component and started writing the FP series
| * 156d5c5 even more
| * 7d3529e lots of stuff, not ready yet
* |   e162e8d Merge pull request #9 from open-sorcerers/gripgrep
|\\ \\
| |/
|/|
| * dde7aa9 (origin/gripgrep) [gripgrep] is cool
|/
*   6b53b6c Merge pull request #11 from open-sorcerers/yarn-cleanups
|\\
| * 47065d1 yarn cleanups
|/
*   73f1f8b Merge pull request #10 from open-sorcerers/website/fix-missing-assets
|\\
| * e44f0f9 fix missing assets
|/
* aa3cb16 [eslint-config-sorcerers] bump version 0.0.2
*   925e8bf Merge pull request #8 from open-sorcerers/try-deps-for-eslint
|\\
| * 6d8730b separate deps differently
| * 83f3ad7 dunno
| * e3119c4 trying out deps instead of peer deps and trying alpha releases
|/
*   b9c26ca Merge pull request #6 from open-sorcerers/website`
  const raw = renderTree(parser(EXAMPLE))
  expect(
    raw
      .split('\n')
      .map(z => z.trim())
      .join('\n')
  ).toEqual(`*   a3b2eca
|\\
| * 3584389
|/
*   4567b6a
|\\
| * b64af6c
| * f33c9ae
| * ebf7816
| * 156d5c5
| * 7d3529e
* |   e162e8d
|\\ \\
| |/
|/|
| * dde7aa9
|/
*   6b53b6c
|\\
| * 47065d1
|/
*   73f1f8b
|\\
| * e44f0f9
|/
* aa3cb16
*   925e8bf
|\\
| * 6d8730b
| * 83f3ad7
| * e3119c4
|/
*   b9c26ca`)
})
