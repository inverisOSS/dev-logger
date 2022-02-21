// Q&D CJS Version
const chalk = require('chalk')

const jsome = require('./jsome/index.js')

const defaultColors = {
  // common colors
  date: 'green',
  group: 'grey',
  name: 'grey',

  // data (jsome) colors
  num: 'cyan',
  str: 'magenta',
  bool: 'red',
  regex: 'blue',
  undef: 'grey',
  null: 'grey',
  attr: 'green',
  quot: 'yellow',
  punc: 'yellow',
  brack: 'yellow',

  // level colors
  trace: 'blueBright',
  debug: 'cyanBright',
  info: 'whiteBright',
  success: 'greenBright',
  warn: 'yellowBright',
  error: 'red',
  fatal: 'yellowBright bgRed'
}

/**
 * Value could have multiple words.
 * Each word is a log-function, with e.g. 'warn warning' `log.warn(msg)` and `log.warning(msg)` are possible.
 *
 * First word is the output prefix, 'warn warning' with `log.warning(msg)` `WARN` is printed.
 *
 * So if you want all prefixes with the same length, e.g. 3 chars, you can set 'tra trace', 'deb debug', ...
 * but you must define colors too with the name 'tra', 'deb', ... !
 */
const defaultLevels = {
  10: 'trace',
  20: 'debug',
  30: 'info',
  40: 'success',
  50: 'warn warning',
  60: 'error',
  70: 'fatal',
  100: 'quiet'
}

const defaultOptions = {
  colors: defaultColors,
  group: '',
  levels: defaultLevels,
  logLevel: 10,
  name: '',

  // formatterInit options
  upperCaseLevelName: true,
  padStartLevelName: false,
  padEndLevelName: false,
  withDate: false,
  withGroup: true,
  withName: true
}

let oldGroup = ''

/**
 *
 */
class Logger {
  /**
   * Constructor
   */
  constructor(options = {}) {
    if (typeof options === 'string') {
      this.options = Object.assign({}, defaultOptions)
      this.options.group = options
    } else {
      this.options = Object.assign({}, defaultOptions, options)
    }

    this.isInitialized = false

    this.setColors(this.options.colors)
    this.setGroup(this.options.group)
    this.setName(this.options.name)
    this.setLevels(this.options.levels)
    this.setLogLevel(this.options.logLevel)

    this.isInitialized = true

    this.formatterInit()
  }

  /**
   * Set colors
   */
  setColors(colors) {
    if (typeof colors !== 'object') {
      throw new Error(`colors must be an object, e.g. { trace: 'blueBright' }`)
    }
    this.colors = Object.assign({}, defaultColors, colors)
    jsome.colors = Object.assign({}, defaultColors, colors)
    this.formatterInit()
  }

  /**
   * Set the group
   */
  setGroup(group = '') {
    if (typeof group !== 'string') {
      throw new Error(`group must be a string`)
    }
    this.group = group

    this.formatterInit()
  }

  /**
   * Set the name
   */
  setName(name = '') {
    if (typeof name !== 'string') {
      throw new Error(`name must be a string`)
    }
    this.name = name

    this.formatterInit()
  }

  /**
   * Set log levels
   */
  setLevels(levels) {
    if (typeof levels !== 'object') {
      throw new Error(`levels must be an object, e.g. { 10: 'trace' }`)
    }

    if (this.isInitialized) {
      this._deleteMethods()
    }

    this.levels = levels

    this._createMethods()

    this.formatterInit()
  }

  /**
   * Set the current log level
   */
  setLogLevel(level) {
    const keys = Object.keys(this.levels)
    if (typeof level === 'string') {
      this.logLevel = keys.find( (key) => this.levels[key] === level)
    } else {
      this.logLevel = this.levels[level] ? level : undefined
    }
    if ( ! this.logLevel) {
      throw new Error(`unknown logLevel '${level}'`)
    }

    this.formatterInit()
  }

  /**
   * Little optimiziation for faster output (precompile)
   */
  formatterInit() {
    if ( ! this.isInitialized) {
      return
    }

    // detect longest level name
    let longestLevel = 0
    for (const level in this.levels) {
      const levelNames = this.levels[level].split(' ')
      for (const levelName of levelNames) {
        longestLevel = Math.max(longestLevel, levelName.length)
      }
    }

    // precompile level names for output
    const levels = {}
    for (const level in this.levels) {
      const levelNames = this.levels[level].split(' ')
      let content = levelNames[0]
      if (this.options.upperCaseLevelName) {
        content = content.toUpperCase()
      }
      if (this.options.padStartLevelName) {
        content = content.padStart(longestLevel, ' ')
      }
      if (this.options.padEndLevelName) {
        content = content.padEnd(longestLevel, ' ')
      }
      levels[level] = content
    }

    // precompile color output functions
    const colors = {}
    for (const key in this.colors) {
      const colorNames = this.colors[key].split(' ')
      let colorFunc = chalk
      for (const color of colorNames) {
        colorFunc = colorFunc[color]
      }
      colors[key] = colorFunc
    }

    this.outputOptions = {
      levels,
      colors
    }
  }

  /**
   * Add options for the current running output
   */
  formatterOptions(level) {
    const options = {
      date: '',
      level,
      levelName: this.levels[level].split(' ')[0],
      outputLevelName: this.outputOptions.levels[level]
    }

    this.options.output = Object.assign({}, this.outputOptions, options)

    if (this.options.withDate) {
      this.options.output.date = this._getColorFunc('date')(`[${new Date().toISOString()}]`) + ' '
    }
  }

  /**
   * Format the group
   */
  formatterGroup(group) {
    if (this.options.withGroup) {
      if (group !== oldGroup) {
        oldGroup = group

        // ignore empty group
        if (group) {
          return this._getColorFunc('group')(group)
        }
      }
    }
    return ''
  }

  /**
   * Format the date
   */
  formatterDate() {
    return this.options.output.date
  }

  /**
   * Format a line
   */
  formatterLine(line) {
    let content = ''
    content += this.formatterDate()
    content += (this.options.withName && this.name) ? this._getColorFunc('name')(this.name) + ' ' : ''
    content += this._getColorFunc(this.options.output.levelName)(this.options.output.outputLevelName)
    content += ' ' + line
    return content
  }

  /**
   * Format the data and output
   */
  formatterOutput(args) {
    let content = ''

    // format args
    for (const arg of args) {
      if (arg === undefined) {
        content += (content.length > 0) ? '\n' : ''
        content += this._getColorFunc('undef')(arg) + '\n'
      } else if (arg instanceof RegExp) {
        content += (content.length > 0) ? '\n' : ''
        content += this._getColorFunc('regex')(arg) + '\n'
      } else if (typeof arg === 'object') {
        content += (content.length > 0) ? '\n' : ''
        content += jsome.getColoredString(arg) + '\n'
      } else if (content.length === 0) {
        content += this._getColorFunc(this.options.output.levelName)(arg)
      } else {
        // add space if no previous line break, in case of multiple args
        content += (content[content.length - 1] !== '\n') ? ' ' : ''
        content += jsome.getColoredString(arg)
      }
    }

    // format each line
    content = content.trim()
      .split('\n')
      .map( (line) => {
        return this.formatterLine(line)
      })
      .join('\n')

    // output
    const groupContent = this.formatterGroup(this.group)
    if (groupContent) {
      content = groupContent + '\n' + content
    }

    return content
  }

  /**
   * Return a log method (trace, info, ...)
   */
  _createLogMethod(level) {
    return (...args) => {
      if (parseInt(level) < parseInt(this.logLevel)) {
        return
      }

      this.formatterOptions(level)
      const content = this.formatterOutput(args)
      console.log(content)
    }
  }

  /**
   * Add dynamic methods (trace, info, ...)
   */
  _createMethods() {
    for (const level in this.levels) {
      const levelNames = this.levels[level].split(' ')
      for (const levelName of levelNames) {
        this[levelName] = this._createLogMethod(level)
      }
    }
  }

  /**
   * Remove old dynamic methods (trace, info, ...)
   */
  _deleteMethods() {
    for (const level in this.levels) {
      const levelNames = this.levels[level].split(' ')
      for (const levelName of levelNames) {
        delete this[levelName]
      }
    }
  }

  /**
   * Return a color function
   */
  _getColorFunc(key) {
    if ( ! this.options.output.colors[key]) {
      // output without color
      return (content) => content
    }

    return this.options.output.colors[key]
  }
}

module.exports = {
  chalk,
  jsome,
  defaultColors,
  defaultLevels,
  defaultOptions,
  Logger
}
