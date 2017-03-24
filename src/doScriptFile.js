const exec = require( 'child_process' ).exec

const log = require( './logger' )

module.exports = function doScriptFile( file ) {

	// An alert comes from ESTK if it already open when running the command
	// So we need to close it before running the command
	quitESTK()

	return new Promise( ( resolve, reject ) => {
		const command = getESTKCommand( file )

		log.verbose( 'Converting' )
		log.debug( 'Command: ', command )

		// Execute the command
		exec( command, err => {
			if ( err ) {
				return reject( err )
			}
			resolve()
		} )
	} )
}

function getESTKCommand( scriptFile ) {
	return `"${getESTKPath()}" -cmd ${scriptFile}`
}

function getESTKPath() {

	// OSX
	if ( process.platform === 'darwin' ) {

		// FIXME: Do not assume path to ESTK is always this
		const path = '/Applications/Adobe ExtendScript Toolkit CC/ExtendScript Toolkit.app/Contents/MacOS/ExtendScript Toolkit'

		return path

	// Windows
	} else if ( process.platform === 'win32' ) {

		// FIXME: Do not assume path to ESTK is always this
		const path = 'C:\\Program Files ^(x86)\\Adobe\\Adobe ExtendScript Toolkit CC\\ExtendScript Toolkit.exe'

		return path.replace( / /g, '\^ ' )

	// Linux
	} else {
		throw Error( `Platform ${process.platform} is not supported` )
	}
}

function quitESTK() {
	log.verbose( 'Quitting ExtendScript Toolkit, if it is open' )

	// OSX
	if ( process.platform === 'darwin' ) {
		exec( 'osascript -e \'quit app "ExtendScript Toolkit"\'' )

	// Windows
	} else if ( process.platform === 'win32' ) {
		exec( 'taskkill /IM ExtendScript Toolkit.exe' )

	// Linux
	} else {
		throw Error( `Platform ${process.platform} is not supported` )
	}
}
