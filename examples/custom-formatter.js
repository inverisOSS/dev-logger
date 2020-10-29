//
// With custom formatter
//

// const DevLogger = require('@inveris/dev-logger')
const DevLogger = require('../lib')

class MyLogger extends DevLogger {
  /**
   * Little optimiziation for faster output (precompile)
   */
  formatterInit(...args) {
    // for details view source `lib/index.js`
    return super.formatterInit(...args)
  }

  /**
   * Add options for the current running output
   */
  formatterOptions(...args) {
    // for details view source `lib/index.js`
    return super.formatterOptions(...args)
  }

  /**
   * Format the group
   */
  formatterGroup(...args) {
    // for details view source `lib/index.js`
    return super.formatterGroup(...args)
  }

  /**
   * Returns only Hours:Minutes.Milliseconds
   */
  formatterDate(...args) {
    const date = new Date()
    return this._getColorFunc('date')(`[${date.getHours()}:${date.getMinutes()}.${date.getMilliseconds()}]`) + ' '
  }

  /**
   * Adds "  Each line: " on each line
   */
  formatterLine(...args) {
    const content = super.formatterLine(...args)
    return '  Each line: ' + content
  }

  /**
   * Formats the content of the block (all formatter return values)
   */
  formatterOutput(...args) {
    const content = super.formatterOutput(...args)
    return '<BEFORE BLOCK>\n' + content + '\n<AFTER BLOCK>'
  }
}

const log = new MyLogger({
  group: __filename,
  name: 'MyApp',

  withDate: true,
  withGroup: true,
  withName: true
})

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
