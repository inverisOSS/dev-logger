// jsom 2.5.0
// https://github.com/Javascipt/Jsome

const stringify = require('safe-stable-stringify')

const generator = require('./generator')

const colors = {
  num  : 'cyan',
  str  : 'magenta',
  bool : 'red',
  regex: 'blue',
  undef: 'grey',
  null : 'grey',
  attr : 'green',
  quot : 'yellow',
  punc : 'yellow',
  brack: 'yellow'
}

const level = {
  show  : false,
  char  : '.',
  color : 'red',
  spaces: 2,
  start : 0
}

const params = {
  colored : true,
  async   : false,
  lintable: false
}

function jsome (json, callBack) {
  return jsome.parse(stringify(json), callBack)
}

jsome.colors = colors
jsome.level = level
jsome.params = params

generator.setJsomeRef(jsome)

jsome.parse = function (jsonString, callBack) {
  const json = JSON.parse(jsonString)
  if (!jsome.params.async) {
    const output = generator.gen(json, jsome.level.start)
    if (Array.isArray(output)) {
      console.log.apply(console, output)
    } else {
      console.log(output)
    }
  } else {
    setTimeout(function () {
      console.log(generator.gen(json, jsome.level.start))
      callBack && callBack()
    })
  }

  return json
}

jsome.getColoredString = function(jsonString, callBack) {
  const json = JSON.parse(stringify(jsonString))
  if (!jsome.params.async) {
    const output = generator.gen(json, jsome.level.start)
    return output
  } else {
    setTimeout(function () {
      const output = generator.gen(json, jsome.level.start)
      callBack && callBack(output)
    })
  }
}

module.exports = jsome
