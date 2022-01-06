import chalk from 'chalk'

import browserStyle from './browser-style.js'

let jsomeRef
const browserColors = []

function getType (value) {
  const map = {
    '[object Number]'  : 'num',
    '[object String]'  : 'str',
    '[object Boolean]' : 'bool',
    '[object RegExp]'  : 'regex',
    '[object Function]': 'func',
    null               : 'null',
    undefined          : 'undef'
  }

  return map[toString.call(value)] || map['' + value]
}

function isBrowser () {
  return typeof window === 'object'
}

function repeat (str, times) {
  return Array(times ? (times + 1) : 0).join(str)
}

function cleanObject (obj) {
  let lastKey = ''
  for (const key in obj) {
    if (getType(obj[key]) === 'func') {
      delete obj[key]
    } else {
      lastKey = key
    }
  }
  return lastKey
}

function cleanArray (arr) {
  return arr.filter(function (item) {
    return getType(item) !== 'func'
  })
}

function generateLevel (level) {
  let levelStr = repeat(' ', jsomeRef.level.spaces)
  const opts = jsomeRef.level

  if (jsomeRef.level.show && levelStr.length) {
    levelStr = levelStr.replace(' ', useColorProvider(opts.char, opts.color))
  }

  return repeat(levelStr, level)
}

function hasChild (obj) {
  for (const key in obj) {
    if (isArray(obj[key]) || isObject(obj[key])) return true
  }
}

function isArray (arr) {
  return toString.call(arr).match(/^\[object Array\]$/)
}

function isObject (obj) {
  return toString.call(obj).match(/^\[object Object\]$/)
}

function colorify (value, level) {
  const color = jsomeRef.colors[getType(value)]
  return generateLevel(level) +
    (getType(value) === 'str' ? colorifySpec('"', 'quot') : '') +
    useColorProvider('' + value, color) +
    (getType(value) === 'str' ? colorifySpec('"', 'quot') : '')
}

function colorifySpec (char, type, level) {
  const quote = (
    jsomeRef.params.lintable && type === 'attr'
      ? colorifySpec('"', 'quot', 0)
      : ''
  )
  return generateLevel(level) + quote + useColorProvider('' + char, jsomeRef.colors[type]) + quote
}

function useColorProvider (str, color) {
  if (isBrowser()) {
    const style = (isArray(color) ? color : [color]).map(function (item) {
      return browserStyle[item]
    }).join('')
    browserColors.push(style)
    return "%c" + str
  } else {
    if (jsomeRef.params.colored) {
      if (isArray(color)) {
        if (color.length) {
          return useColorProvider(chalk[color[0]](str), color.slice(1))
        } else {
          return str
        }
      } else {
        return chalk[color](str)
      }
    }
  }

  return str
}

export default {
  gen : function (json, level, isChild) {
    const colored = []
    level = level || 0

    if (isObject(json)) {
      const lastKey = cleanObject(json)
      colored.push(colorifySpec('{', 'brack', isChild ? 0 : level))
      level++

      for (const key in json) {
        const result = colorifySpec(key, 'attr', level) +
          colorifySpec(': ', 'punc') +
          this.gen(json[key], level, true) +
          (key !== lastKey ? colorifySpec(',', 'punc') : '')
        colored.push(result)
      }

      colored.push(colorifySpec('}', 'brack', --level))
    } else if (isArray(json)) {
      json = cleanArray(json)

      if (hasChild(json)) {
        const result = json.map(function(item) {
          return this.gen(item, level + 1)
        }.bind(this))

        colored.push(colorifySpec('[', 'brack', isChild ? 0 : level))
        colored.push(result.join(colorifySpec(', ', 'punc') + '\n' ))
        colored.push(colorifySpec(']', 'brack', level))
      } else {
        let coloredArray = colorifySpec('[', 'brack', isChild ? 0 : level)
        for (const key in json) {
          coloredArray += colorify(json[key]) + (json.length - 1 > key ? colorifySpec(', ', 'punc') : '')
        }
        colored.push(coloredArray + colorifySpec(']', 'brack'))
      }
    } else {
      return generateLevel(isChild ? 0 : level) + colorify(json)
    }

    return isBrowser() ? [colored.join('\n')].concat(browserColors) : colored.join('\n')
  },

  setJsomeRef : function (jsome) {
    jsomeRef = jsome
    return this
  }
}
