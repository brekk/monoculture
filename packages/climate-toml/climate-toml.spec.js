import { configFile } from 'climate'
import { fork } from 'fluture'
import tomlPlugin from './climate-toml'

const TEST_CONF_RAW = {
  fixture: 'test',
  info: 'this is a test file',
  cool: { data: ['yes'], nice: { oh: 111111 } },
}

test('configFile - plugin integration', done => {
  fork(done)(raw => {
    expect(raw).toEqual(TEST_CONF_RAW)
    done()
  })(
    configFile({
      ns: 'testtomlconf',
      transformer: [
        tomlPlugin,
        { name: 'nothing', test: () => true, parse: z => z.reverse() },
      ],
    })
  )
})
