//
// Returns a single instance of dev-logger (why ever you will need it?)
// view `singleton.js` for usage
//

// import DevLogger from '@inveris/dev-logger'
import DevLogger from '../lib/index.js'

const log = new DevLogger(/* your options */)

/**
 * Quick & dirty singleton logger
 */
function getLogger(group /* your options */) {
  const methods = {}

  // add log methods
  for (const name in log) {
    if (typeof log[name] === 'function') {
      methods[name] = (...args) => {
        log.setGroup(group) // your options (setGroup, setName, whatever)

        // call log method
        log[name](...args)
      }
    }
  }

  // bind instance properties
  const props = Object.getOwnPropertyNames( Object.getPrototypeOf(log) )
  for (const name of props) {
    if (typeof log[name] === 'function') {
      methods[name] = log[name].bind(log)
    }
  }

  return methods
}

export default getLogger
