import { configFile } from 'climate'
import { fork } from 'fluture'
import { plugin } from './climate-json'
import PKG from './package.json'

test('configFile - json plugin integration', done => {
  fork(done)(raw => {
    expect(raw).toEqual(PKG)
    done()
  })(
    configFile({
      source: __dirname + '/package.json',
      transformer: [
        plugin,
        { name: 'nothing', test: () => true, parse: z => z.reverse() },
      ],
    })
  )
})
