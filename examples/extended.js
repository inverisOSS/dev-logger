//
// Extended output examples
//

// const DevLogger = require('@inveris/dev-logger')
const DevLogger = require('../lib')

/**
 * With grouping and naming
 */
function groupExample() {
  const log = new DevLogger({
    group: __filename,
    name: 'MyApp',

    withGroup: true,
    withName: true
  })

  log.info('A group (filename) is only displayed when on group changes')
  log.info('Now you see no group before that line')

  const log2 = new DevLogger({
    group: 'Other group',
    name: 'MyApp',

    withGroup: true,
    withName: true
  })
  log2.info('Now you see a new group')

  log.info('Here too')
  log.info('Here not')
}

console.log('\nGroup and name example:')
console.log('=======================')
groupExample()

/**
 * With date
 */
function dateExample() {
  const log = new DevLogger({
    withDate: true
  })

  log.info('Date is visible before')
}

console.log('\nDate example:')
console.log('=============')
dateExample()

/**
 * Change colors
 */
function colorExample() {
  const log = new DevLogger({
    // custom colors
    colors: {
      // common colors
      date: 'green',
      group: 'grey',
      name: 'grey',

      // data (jsome) colors
      num: 'cyan',
      str: 'red',
      bool: 'red',
      regex: 'blue',
      undef: 'grey',
      null: 'grey',
      attr: 'green',
      quot: 'yellow',
      punc: 'yellow',
      brack: 'yellow',

      // level colors
      trace: 'black bgGrey',
      debug: 'red bgCyanBright',
      info: 'underline whiteBright',
      success: 'greenBright',
      warn: 'yellowBright',
      error: 'red',
      fatal: 'yellowBright bgRed'
    }
  })

  log.trace('trace message')
  log.debug('debug message')
  log.info('info message')
}

console.log('\nColor example:')
console.log('==============')
colorExample()

/**
 * Custom levels
 */
function customLevelsExample() {
  const log = new DevLogger({
    levels: {
      100: 'basic',
      200: 'normal',
      300: 'extended'
    },
    logLevel: 'normal',
    colors: {
      normal: 'green',
      extended: 'yellow'
    },
    padStartLevelName: true // spaces before
  })

  try {
    log.trace('trace, info, ... not exists anymore')
  } catch (err) {
    // ignore errors
  }

  log.basic('basic is not visible, logLevel is set to normal')
  log.normal('normal message')
  log.extended('extended message')
}

console.log('\nCustom levels example:')
console.log('======================')
customLevelsExample()
