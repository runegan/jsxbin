const exec = require( 'child_process' ).exec
const fs = require( 'fs' )

const log = require( './logger' )

module.exports = function doScriptFiles( files ) {
	let chain = Promise.resolve()
	files.forEach( file => {
		chain = chain.then( () => doScriptFile( file ) )
	})
	return chain
}


function doScriptFile( file ) {
	// An alert comes from ESTK if it already open when running the command
	// So we need to close it before running the command
	return quitESTK()
		.then( () => execute( file ) )
}

function execute( file ) {
	const command = getESTKCommand( file )

	log.verbose( 'Converting' )
	log.debug( 'Command: ', command )

		// Execute the command
	return execPromise( command )
}

function execPromise( command ) {
	return new Promise( ( resolve, reject ) => {
		// Execute the command
		exec( command, err => {
			if ( err ) {
				return reject( err )
			}
			resolve()
		})
	})
}

function getESTKCommand( scriptFile ) {
	return `"${getESTKPath()}" -cmd ${scriptFile}`
}

function getESTKPath() {
	let path = null

	// OSX
	if ( process.platform === 'darwin' ) {
		path = checkPaths( '/Applications/Adobe ExtendScript Toolkit CC/ExtendScript Toolkit.app/Contents/MacOS/ExtendScript Toolkit',
			'/Applications/Adobe ExtendScript Toolkit CC/ExtendScript Toolkit.app/Contents/MacOS/ExtendScript Toolkit',
			'/Applications/Utilities/Adobe Utilities - CS6.localized/ExtendScript Toolkit CS6/ExtendScript Toolkit.app/Contents/MacOS/ExtendScript Toolkit'
		)

	// Windows
	} else if ( process.platform === 'win32' ) {
		path = checkPaths( 'C:\\Program Files ^(x86)\\Adobe\\Adobe ExtendScript Toolkit CC\\ExtendScript Toolkit.exe',
			'C:\\Program Files ^(x86)\\Adobe\\Adobe ExtendScript Toolkit\\ExtendScript Toolkit.exe'
		)

		if ( path !== null ) {
			path = path.replace( / /g, '^ ' )
		}

	// Linux
	} else {
		throw Error( `Platform ${process.platform} is not supported` )
	}

	log.debug( 'ESTK Path:', path )
	if ( path === null ) {
		throw Error( 'Could not find ExtendScript Toolkit installation' )
	}
	return path

	function checkPaths( ...paths ) {
		let thePath = null

		// Return the first existing path
		paths.forEach( path => {
			if ( fs.existsSync( path ) ) {
				thePath = path
				return false
			}
		})

		return thePath
	}
}

function quitESTK() {
	log.verbose( 'Quitting ExtendScript Toolkit, if it is open' )

	// OSX
	if ( process.platform === 'darwin' ) {
		return execPromise( 'osascript -e \'quit app "ExtendScript Toolkit"\'' )

	// Windows
	} else if ( process.platform === 'win32' ) {
		return execPromise( 'taskkill /IM ExtendScript Toolkit.exe' )
	}
	throw Error( `Platform ${process.platform} is not supported` )
}
