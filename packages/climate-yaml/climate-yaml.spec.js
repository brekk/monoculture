import { configFile } from 'climate'
import { fork } from 'fluture'
import { plugin, many } from './climate-yaml'

const TEST_CONF_MANY_RAW = [
  { front: 'matter, back, chatter', yaml: 'ham scramble' },
  {
    how: {
      now: { brown: { koo: ['a', 'b', 'c', 'd'] } },
      sow: { teacup: { pig: true } },
    },
    oh: { yeah: 'kool-aid' },
  },
]
const [headmatter, TEST_CONF_RAW] = TEST_CONF_MANY_RAW

test('configFile - yaml plugin integration', done => {
  fork(done)(raw => {
    expect(raw).toEqual(TEST_CONF_RAW)
    done()
  })(
    configFile({
      ns: 'testyamlconf',
      transformer: [
        plugin,
        { name: 'nothing', test: () => true, parse: z => z.reverse() },
      ],
    })
  )
})

test('configFile - yaml-many plugin integration', done => {
  fork(done)(raw => {
    expect(raw).toEqual(TEST_CONF_MANY_RAW)
    done()
  })(
    configFile({
      ns: 'testyamlmanyconf',
      transformer: [
        many,
        { name: 'nothing', test: () => true, parse: z => z.reverse() },
      ],
    })
  )
})
