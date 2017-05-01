const winston = require( 'winston' )
const logger = new ( winston.Logger )()

logger.add( winston.transports.Console, {
	prettyPrint: true,
	colorize: true,
	silent: false,
	timestamp: false
})

logger.cli()

module.exports = logger
