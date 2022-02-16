const chai = require('chai')
const chalk = require('chalk')
const stripAnsi = require('strip-ansi')

const lib = require('../lib/index.cjs')

const assert = chai.assert
const Logger = lib.Logger
const colors = lib.defaultColors

// precompile color output functions for easier use in tests
const cf = {} // color functions
for (const key in colors) {
  const colorNames = colors[key].split(' ')
  let colorFunc = chalk
  for (const color of colorNames) {
    colorFunc = colorFunc[color]
  }
  cf[key] = colorFunc
}

describe('Logger tests', () => {
  let originalStdout
  let output = ''

  before( function() {
    // redirect stdout to capture the content
    originalStdout = process.stdout.write.bind(process.stdout)

    process.stdout.write = (chunk, encoding, callback) => {
      output += chunk

      // hide output on `npm run test`
      if ( ! process.env.SILENT) {
        originalStdout(chunk, encoding, callback)
      }
    }
  })

  beforeEach( function() {
    // reset output on each test
    output = ''
  })

  after( function() {
    // restore stdout
    process.stdout.write = originalStdout
  })

  describe('simple log output', () => {
    let log

    before( function() {
      log = new Logger()
    })

    it('log trace', () => {
      log.trace('Trace')
      assert.equal(stripAnsi(output), 'TRACE Trace\n')
      assert.equal(output, cf.trace('TRACE') + ' ' + cf.trace('Trace') + '\n')
    })

    it('log debug', () => {
      log.debug('Debug')
      assert.equal(stripAnsi(output), 'DEBUG Debug\n')
      assert.equal(output, cf.debug('DEBUG') + ' ' + cf.debug('Debug') + '\n')
    })

    it('log info', () => {
      log.info('Info')
      assert.equal(stripAnsi(output), 'INFO Info\n')
      assert.equal(output, cf.info('INFO') + ' ' + cf.info('Info') + '\n')
    })

    it('log success', () => {
      log.success('Success')
      assert.equal(stripAnsi(output), 'SUCCESS Success\n')
      assert.equal(output, cf.success('SUCCESS') + ' ' + cf.success('Success') + '\n')
    })

    it('log warn', () => {
      log.warn('Warn')
      assert.equal(stripAnsi(output), 'WARN Warn\n')
      assert.equal(output, cf.warn('WARN') + ' ' + cf.warn('Warn') + '\n')
    })

    it('log warning', () => {
      log.warning('Warning')
      assert.equal(stripAnsi(output), 'WARN Warning\n')
      assert.equal(output, cf.warn('WARN') + ' ' + cf.warn('Warning') + '\n')
    })

    it('log error', () => {
      log.error('Error')
      assert.equal(stripAnsi(output), 'ERROR Error\n')
      assert.equal(output, cf.error('ERROR') + ' ' + cf.error('Error') + '\n')
    })

    it('log fatal', () => {
      log.fatal('Fatal')
      assert.equal(stripAnsi(output), 'FATAL Fatal\n')
      assert.equal(output, cf.fatal('FATAL') + ' ' + cf.fatal('Fatal') + '\n')
    })
  })

  describe('log output with params', () => {
    let log

    before( function() {
      log = new Logger()
    })

    it('with string', () => {
      log.trace('String', 'str')
      assert.equal(stripAnsi(output), 'TRACE String "str"\n')
      assert.equal(output,
        cf.trace('TRACE') + ' ' + cf.trace('String') + ' ' +
        cf.quot('"') + cf.str('str') + cf.quot('"') + '\n'
      )
    })

    it('with number', () => {
      log.trace('Number', 4711)
      assert.equal(stripAnsi(output), 'TRACE Number 4711\n')
      assert.equal(output,
        cf.trace('TRACE') + ' ' + cf.trace('Number') + ' ' +
        cf.num(4711) + '\n'
      )
    })

    it('with boolean', () => {
      log.trace('Boolean', true)
      assert.equal(stripAnsi(output), 'TRACE Boolean true\n')
      assert.equal(output,
        cf.trace('TRACE') + ' ' + cf.trace('Boolean') + ' ' +
        cf.bool(true) + '\n'
      )
    })

    it('with regex', () => {
      log.trace('RegEx', new RegExp('' + 'ab+c'))
      assert.equal(stripAnsi(output), 'TRACE RegEx\nTRACE /ab+c/\n')
      assert.equal(output,
        cf.trace('TRACE') + ' ' + cf.trace('RegEx') + '\n' +
        cf.trace('TRACE') + ' ' + cf.regex('/ab+c/') + '\n'
      )
    })

    it('with undefined', () => {
      log.trace('Undefined', undefined)
      assert.equal(stripAnsi(output), 'TRACE Undefined\nTRACE undefined\n')
      assert.equal(output,
        cf.trace('TRACE') + ' ' + cf.trace('Undefined') + '\n' +
        cf.trace('TRACE') + ' ' + cf.undef('undefined') + '\n'
      )
    })

    it('with null', () => {
      log.trace('Null', null)
      assert.equal(stripAnsi(output), 'TRACE Null\nTRACE null\n')
      assert.equal(output,
        cf.trace('TRACE') + ' ' + cf.trace('Null') + '\n' +
        cf.trace('TRACE') + ' ' + cf.null('null') + '\n'
      )
    })

    it('with array', () => {
      log.trace('Array', [ 'a', 'b' ])
      assert.equal(stripAnsi(output), 'TRACE Array\nTRACE ["a", "b"]\n')
      assert.equal(output,
        cf.trace('TRACE') + ' ' + cf.trace('Array') + '\n' +
        cf.trace('TRACE') + ' ' + cf.brack('[') +
        cf.quot('"') + cf.str('a') + cf.quot('"') +
        cf.punc(', ') + cf.quot('"') + cf.str('b') + cf.quot('"') +
        cf.brack(']') + '\n'
      )
    })

    it('with object', () => {
      log.trace('Object', { a: 'b' })
      assert.equal(stripAnsi(output), 'TRACE Object\nTRACE {\nTRACE   a: "b"\nTRACE }\n')
      assert.equal(output,
        cf.trace('TRACE') + ' ' + cf.trace('Object') + '\n' +
        cf.trace('TRACE') + ' ' + cf.brack('{') + '\n' +
        cf.trace('TRACE') + '   ' + cf.attr('a') + cf.punc(': ') + cf.quot('"') + cf.str('b') + cf.quot('"') + '\n' +
        cf.trace('TRACE') + ' ' + cf.brack('}') + '\n'
      )
    })

    it('with multiple parameters - object, string, number', () => {
      log.trace('Multiple', { a: 'b' }, 'str', 4711)
      assert.equal(stripAnsi(output),
        'TRACE Multiple\n' +
        'TRACE {\n' +
        'TRACE   a: "b"\n' +
        'TRACE }\n' +
        'TRACE "str" 4711\n'
      )
      assert.equal(output,
        cf.trace('TRACE') + ' ' + cf.trace('Multiple') + '\n' +
        cf.trace('TRACE') + ' ' + cf.brack('{') + '\n' +
        cf.trace('TRACE') + '   ' + cf.attr('a') + cf.punc(': ') + cf.quot('"') + cf.str('b') + cf.quot('"') + '\n' +
        cf.trace('TRACE') + ' ' + cf.brack('}') + '\n' +
        cf.trace('TRACE') + ' ' + cf.quot('"') + cf.str('str') + cf.quot('"') + ' ' + cf.num(4711) + '\n'
      )
    })

    it('with multiple parameters - string, object', () => {
      log.trace('Multiple', 'str', { a: 'b' })
      assert.equal(stripAnsi(output),
        'TRACE Multiple "str"\n' +
        'TRACE {\n' +
        'TRACE   a: "b"\n' +
        'TRACE }\n'
      )
      assert.equal(output,
        cf.trace('TRACE') + ' ' + cf.trace('Multiple') + ' ' + cf.quot('"') + cf.str('str') + cf.quot('"') + '\n' +
        cf.trace('TRACE') + ' ' + cf.brack('{') + '\n' +
        cf.trace('TRACE') + '   ' + cf.attr('a') + cf.punc(': ') + cf.quot('"') + cf.str('b') + cf.quot('"') + '\n' +
        cf.trace('TRACE') + ' ' + cf.brack('}') + '\n'
      )
    })

    it('only regex', () => {
      log.trace(new RegExp('' + 'ab+c'))
      assert.equal(stripAnsi(output), 'TRACE /ab+c/\n')
      assert.equal(output,
        cf.trace('TRACE') + ' ' + cf.regex('/ab+c/') + '\n'
      )
    })

    it('only object', () => {
      log.trace({ a: 'b' })
      assert.equal(stripAnsi(output), 'TRACE {\nTRACE   a: "b"\nTRACE }\n')
      assert.equal(output,
        cf.trace('TRACE') + ' ' + cf.brack('{') + '\n' +
        cf.trace('TRACE') + '   ' + cf.attr('a') + cf.punc(': ') + cf.quot('"') + cf.str('b') + cf.quot('"') + '\n' +
        cf.trace('TRACE') + ' ' + cf.brack('}') + '\n'
      )
    })

    it('undefined', () => {
      log.trace(undefined)
      assert.equal(stripAnsi(output), 'TRACE undefined\n')
      assert.equal(output,
        cf.trace('TRACE') + ' ' + cf.undef(undefined) + '\n'
      )
    })
  })

  describe('set log level', () => {
    let log

    before( function() {
      log = new Logger()
    })

    it('no output', () => {
      log.setLogLevel('info')
      log.trace('Trace')
      assert.equal(output, '') // empty, cause logLevel is `info`
    })

    it('log info', () => {
      log.info('Info')
      assert.equal(stripAnsi(output), 'INFO Info\n')
      assert.equal(output, cf.info('INFO') + ' ' + cf.info('Info') + '\n')
    })

    it('should fail, unkown log level - number', () => {
      try {
        log.setLogLevel(99)
      } catch (err) {
        const message = 'unknown logLevel'
        assert.equal(message, err.message.substr(0, message.length))
      }
    })

    it('should fail, unkown log level - string', () => {
      try {
        log.setLogLevel('unknown')
      } catch (err) {
        const message = 'unknown logLevel'
        assert.equal(message, err.message.substr(0, message.length))
      }
    })
  })

  describe('set log levels', () => {
    let log

    before( function() {
      log = new Logger()
    })

    it('create new log methods and remove old', () => {
      log.setLevels({
        100: 'basic',
        200: 'enhanced'
      })

      log.setLogLevel('enhanced')

      assert.notExists(log.trace)
      assert.notExists(log.debug)
      assert.notExists(log.info)
      assert.notExists(log.success)
      assert.notExists(log.warn)
      assert.notExists(log.warning)
      assert.notExists(log.error)
      assert.notExists(log.fatal)

      assert.exists(log.basic)
      assert.exists(log.enhanced)

      log.basic('Basic')
      assert.equal(output, '') // empty, cause logLevel is `info`

      log.enhanced('Enhanced')
      assert.equal(stripAnsi(output), 'ENHANCED Enhanced\n')
    })

    it('should fail, not an object', () => {
      try {
        log.setLevels('fail')
      } catch (err) {
        const message = 'levels must be an object'
        assert.equal(message, err.message.substr(0, message.length))
      }
    })
  })

  describe('option string instead of object', () => {
    let log

    before( function() {
      log = new Logger('StringGroup')
    })

    it('log trace', () => {
      log.trace('Trace')
      assert.equal(stripAnsi(output), 'StringGroup\nTRACE Trace\n')
      assert.equal(output,
        cf.group('StringGroup') + '\n' +
        cf.trace('TRACE') + ' ' + cf.trace('Trace') + '\n'
      )
    })
  })

  describe('test group', () => {
    let log

    before( function() {
      log = new Logger()
    })

    afterEach( function() {
      // restore group
      log.setGroup('OtherGroup1')
    })

    it('set group', () => {
      log.setGroup('NewGroup1')

      log.trace('Trace')
      assert.equal(stripAnsi(output), 'NewGroup1\nTRACE Trace\n')
      assert.equal(output,
        cf.group('NewGroup1') + '\n' +
        cf.trace('TRACE') + ' ' + cf.trace('Trace') + '\n'
      )
    })

    it('check previous group', () => {
      log.trace('Trace')
      assert.equal(stripAnsi(output), 'OtherGroup1\nTRACE Trace\n')
      assert.equal(output,
        cf.group('OtherGroup1') + '\n' +
        cf.trace('TRACE') + ' ' + cf.trace('Trace') + '\n'
      )
    })

    it('without group', () => {
      const log = new Logger({
        withGroup: false
      })

      log.trace('Trace')
      assert.equal(stripAnsi(output), 'TRACE Trace\n')
      assert.equal(output,
        cf.trace('TRACE') + ' ' + cf.trace('Trace') + '\n'
      )
    })

    it('without group argument', () => {
      const log = new Logger()
      log.setGroup()

      log.trace('Trace')
      assert.equal(stripAnsi(output), 'TRACE Trace\n')
      assert.equal(output,
        cf.trace('TRACE') + ' ' + cf.trace('Trace') + '\n'
      )
    })
  })

  describe('test name', () => {
    let log

    before( function() {
      log = new Logger({
        withDate: false,
        withGroup: true,
        withName: true
      })
    })

    afterEach( function() {
      // restore name
      log.setName('OtherName1')
    })

    it('set name', () => {
      log.setName('NewName1')

      log.trace('Trace')
      assert.equal(stripAnsi(output), 'NewName1 TRACE Trace\n')
      assert.equal(output, cf.name('NewName1') + ' ' + cf.trace('TRACE') + ' ' + cf.trace('Trace') + '\n')
    })

    it('check previous name', () => {
      log.trace('Trace')
      assert.equal(stripAnsi(output), 'OtherName1 TRACE Trace\n')
      assert.equal(output, cf.name('OtherName1') + ' ' + cf.trace('TRACE') + ' ' + cf.trace('Trace') + '\n')
    })

    it('without name argument', () => {
      const log = new Logger()
      log.setName()

      log.trace('Trace')
      assert.equal(stripAnsi(output), 'TRACE Trace\n')
      assert.equal(output,
        cf.trace('TRACE') + ' ' + cf.trace('Trace') + '\n'
      )
    })
  })

  describe('test group and name', () => {
    let log

    before( function() {
      log = new Logger({
        group: 'OldGroup2',
        name: 'OldName2',

        withDate: false,
        withGroup: true,
        withName: true
      })
    })

    afterEach( function() {
      // restore group and name
      log.setGroup('OtherGroup2')
      log.setName('OtherName2')
    })

    it('set group', () => {
      log.setGroup('NewGroup2')
      log.setName('NewName2')

      log.trace('Trace')
      assert.equal(stripAnsi(output), 'NewGroup2\nNewName2 TRACE Trace\n')
      assert.equal(output,
        cf.group('NewGroup2') + '\n' +
        cf.name('NewName2') + ' ' + cf.trace('TRACE') + ' ' + cf.trace('Trace') + '\n'
      )
    })

    it('check previous group', () => {
      log.trace('Trace')
      assert.equal(stripAnsi(output), 'OtherGroup2\nOtherName2 TRACE Trace\n')
      assert.equal(output,
        cf.group('OtherGroup2') + '\n' +
        cf.name('OtherName2') + ' ' + cf.trace('TRACE') + ' ' + cf.trace('Trace') + '\n'
      )
    })

    it('group should fail, not a string', () => {
      try {
        log.setGroup({})
      } catch (err) {
        const message = 'group must be a string'
        assert.equal(message, err.message.substr(0, message.length))
      }
    })

    it('name should fail, not a string', () => {
      try {
        log.setName({})
      } catch (err) {
        const message = 'name must be a string'
        assert.equal(message, err.message.substr(0, message.length))
      }
    })
  })

  describe('test colors', () => {
    let log

    before( function() {
      log = new Logger()
    })

    afterEach( function() {
      // restore colors
      log.setColors(colors)
    })

    it('set colors', () => {
      // change colors
      // use other names with the same color-value for test (too lazy to re-compile the color-functions `cf`)
      // e. g. change 'str ' to 'red' and check if it is 'bool' (which is also 'red')
      log.setColors({
        // common colors
        date: 'green',
        group: 'grey',
        name: 'grey',

        // data (jsome) colors
        num: 'cyan',
        str: 'red', // set color to bool ('red')
        bool: 'red',
        regex: 'blue',
        undef: 'grey',
        null: 'grey',
        attr: 'green',
        quot: 'yellow',
        punc: 'yellow',
        brack: 'yellow',

        // level colors
        trace: 'yellowBright bgRed', // set color to fatal ('yellowBright bgRed')
        debug: 'cyanBright',
        info: 'whiteBright',
        success: 'greenBright',
        warn: 'yellowBright',
        error: 'red',
        fatal: 'yellowBright bgRed'
      })

      log.trace('Trace', 'str')
      assert.equal(stripAnsi(output), 'TRACE Trace "str"\n')
      assert.equal(output,
        cf.fatal('TRACE') + ' ' + cf.fatal('Trace') + ' ' +
        cf.quot('"') + cf.bool('str') + cf.quot('"') + '\n' // color must be 'red' (bool)
      )
    })

    it('check previous colors', () => {
      log.trace('Trace', 'str')
      assert.equal(stripAnsi(output), 'TRACE Trace "str"\n')
      assert.equal(output,
        cf.trace('TRACE') + ' ' + cf.trace('Trace') + ' ' +
        cf.quot('"') + cf.str('str') + cf.quot('"') + '\n'
      )
    })

    it('should fail, not an object', () => {
      try {
        log.setColors('blue')
      } catch (err) {
        const message = 'colors must be an object'
        assert.equal(message, err.message.substr(0, message.length))
      }
    })
  })

  describe('test formatter with date', () => {
    let log

    before( function() {
      log = new Logger({
        withDate: true
      })
    })

    it('log trace', () => {
      log.trace('Trace')

      // Keep seconds and milliseconds from output
      const matches = output.match(/(:\d*?\.\d*?Z)\]/)
      const date = new Date().toISOString().replace(/(:\d*?\.\d*?Z)/, matches[1])

      assert.equal(stripAnsi(output), '[' + date + '] TRACE Trace\n')
      assert.equal(output, cf.date('[' + date + ']') + ' ' + cf.trace('TRACE') + ' ' + cf.trace('Trace') + '\n')
    })
  })

  describe('test formatter padding', () => {
    it('pad start level name', () => {
      const log = new Logger({
        padStartLevelName: true,
        padEndLevelName: false
      })

      log.info('Info')
      assert.equal(stripAnsi(output), '   INFO Info\n')
      assert.equal(output,
        cf.info('   INFO') + ' ' + cf.info('Info') + '\n'
      )
    })

    it('pad end level name', () => {
      const log = new Logger({
        padStartLevelName: false,
        padEndLevelName: true
      })

      log.info('Info')
      assert.equal(stripAnsi(output), 'INFO    Info\n')
      assert.equal(output,
        cf.info('INFO   ') + ' ' + cf.info('Info') + '\n'
      )
    })
  })

  describe('test formatter capitalization', () => {
    it('upper case level name', () => {
      const log = new Logger({
        upperCaseLevelName: true
      })

      log.trace('Trace')
      assert.equal(stripAnsi(output), 'TRACE Trace\n')
      assert.equal(output,
        cf.trace('TRACE') + ' ' + cf.trace('Trace') + '\n'
      )
    })

    it('lower case level name', () => {
      const log = new Logger({
        upperCaseLevelName: false
      })

      log.trace('Trace')
      assert.equal(stripAnsi(output), 'trace Trace\n')
      assert.equal(output,
        cf.trace('trace') + ' ' + cf.trace('Trace') + '\n'
      )
    })
  })

  describe('test extending formatter', () => {
    it('extends output', () => {
      /**
       * Custom extended Logger
       */
      class CustomLogger extends Logger {
        formatterOutput(args) {
          const content = super.formatterOutput(args)
          return 'ABC ' + content + ' DEF'
        }
      }

      const log = new CustomLogger({
        group: 'ExtendingFormatterGroup'
      })

      log.trace('Trace')
      assert.equal(stripAnsi(output), 'ABC ExtendingFormatterGroup\nTRACE Trace DEF\n')
      assert.equal(output,
        'ABC ' + cf.group('ExtendingFormatterGroup') + '\n' +
        cf.trace('TRACE') + ' ' + cf.trace('Trace') + ' DEF\n'
      )
    })

    it('extends formatter line', () => {
      /**
       * Custom extended Logger
       */
      class CustomLogger extends Logger {
        formatterLine(line) {
          const content = super.formatterLine(line)
          return 'ABC ' + content + ' DEF'
        }
      }

      const log = new CustomLogger({
        group: 'ExtendingFormatterLine'
      })

      log.trace('Trace')
      assert.equal(stripAnsi(output), 'ExtendingFormatterLine\nABC TRACE Trace DEF\n')
      assert.equal(output,
        cf.group('ExtendingFormatterLine') + '\n' +
        'ABC ' + cf.trace('TRACE') + ' ' + cf.trace('Trace') + ' DEF\n'
      )
    })
  })
})
