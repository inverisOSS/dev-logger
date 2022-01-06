//
// A simple basic usage
//

// import DevLogger from '@inveris/dev-logger'
import DevLogger from '../lib/index.js'

import { fileURLToPath } from 'node:url'
const __filename = fileURLToPath(import.meta.url)

const log = new DevLogger({
  group: __filename,
  padEndLevelName: true
})

log.setLogLevel('trace') // it logs everything from trace to fatal

log.trace('trace message')
log.debug('debug message')
log.info('info message')
log.success('success message')
log.warn('warn message')
log.error('error message')
log.fatal('fatal message')

const str1 = 'some value'
const str2 = 'other value'
log.info('with a string', str1)
log.info('with two strings', str1, str2)

const obj = {
  value1: 'abc',
  value2: 123
}
log.info('with an object', obj)

const arr = [ 'a', 'b', 4711 ]
log.info('with an array', arr)
