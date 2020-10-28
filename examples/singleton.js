//
// Use dev-logger with a single instance
//

const DevLogger = require('./singleton-logger')

const log1 = DevLogger('Group1')
const log2 = DevLogger('Group2')

log1.info('log1 message 1')
log1.info('log1 message 2')

log2.info('log2 message 1')
log2.info('log2 message 2')

log1.info('log1 message 3')

log1.setLogLevel('error')

log1.info('log1 message 4 - should be hidden')
