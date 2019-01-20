const exec = require( 'child_process' ).exec
const fs = require( 'fs' )
const path = require( 'path' )

const log = require( './logger' )

module.exports = function doScriptFile( file, customESTKPaths ) {
	// An alert comes from ESTK if it already open when running the command
	// So we need to close it before running the command
	return quitESTK()
		.then( () => execute( file, customESTKPaths ) )
}

function execute( file, customESTKPaths ) {
	const estkPath = getESTKPath( customESTKPaths )
	const command = getESTKCommand( estkPath, path.basename( file ) )
	const scriptDir = path.dirname( file )

	log.verbose( 'Converting' )
	log.debug( 'Command: ', command )

	// Execute the command
	return execPromise( command, scriptDir )
}

function execPromise( command, scriptDir ) {
	return new Promise( ( resolve, reject ) => {
		// Execute the command
		exec( command, { cwd: scriptDir }, err => {
			if ( err ) {
				return reject( err )
			}
			resolve()
		})
	})
}

function getESTKCommand( estkPath, scriptFile ) {
	return `"${estkPath}" -cmd ${scriptFile}`
}

function getESTKPath( customESTKPaths ) {
	let path = null

	const defaultESTKPathsMac = [
		'/Applications/Adobe ExtendScript Toolkit CC/ExtendScript Toolkit.app/Contents/MacOS/ExtendScript Toolkit',
		'/Applications/Utilities/Adobe Utilities - CS6.localized/ExtendScript Toolkit CS6/ExtendScript Toolkit.app/Contents/MacOS/ExtendScript Toolkit'
	]

	const defaultESTKPathsWin = [
		'C:\\Program Files (x86)\\Adobe\\Adobe ExtendScript Toolkit CC\\ExtendScript Toolkit.exe',
		'C:\\Program Files (x86)\\Adobe\\Adobe ExtendScript Toolkit\\ExtendScript Toolkit.exe'
	]

	let pathsToCheck = []

	// OSX
	if ( process.platform === 'darwin' ) {
		pathsToCheck = defaultESTKPathsMac

	// Windows
	} else if ( process.platform === 'win32' ) {
		pathsToCheck = defaultESTKPathsWin

	// Linux
	} else {
		throw Error( `Platform ${process.platform} is not supported` )
	}

	if ( typeof customESTKPaths !== 'undefined' ) {
		if ( Array.isArray( customESTKPaths ) ) {
			pathsToCheck = pathsToCheck.concat( customESTKPaths )
		} else {
			pathsToCheck.push( customESTKPaths )
		}
	}

	path = checkPaths( ...pathsToCheck )

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
		const command = 'START /wait taskkill /f /im "ExtendScript Toolkit.exe"'
		return execPromise( command )
	}
	throw Error( `Platform ${process.platform} is not supported` )
}
