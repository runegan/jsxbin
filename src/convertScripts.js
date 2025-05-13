const path = require( 'path' )
const fs = require( 'fs' )
const log = require( './logger' )

function GetESDInterface() {
	const platform = `${process.platform}`
	const platformArch = `${process.arch}`
	let esdinterface
	if ( platform === 'darwin' ) {
		esdinterface = require( '../esdebugger-core/mac/esdcorelibinterface.node' )
	} else if ( platform === 'win32' ) {
		if ( platformArch === 'x64' || platformArch === 'arm64' ) {
			esdinterface = require( '../esdebugger-core/win/x64/esdcorelibinterface.node' )
		} else {
			esdinterface = require( '../esdebugger-core/win/win32/esdcorelibinterface.node' )
		}
	}

	if ( esdinterface === undefined ) {
		throw new Error( `Platform not supported: ${platform}` )
	}

	return esdinterface
}

function getESDError() {
	const error = GetESDInterface().esdGetLastError()
	let message = 'unknown'
	if ( error.status !== 0 && error.data ) {
		message = error.data
	}
	throw new Error( `Error with ESTK: '${message}'` )
}

function convertFileContents( scriptPath ) {
	let content
	try {
		content = fs.readFileSync( scriptPath ).toString()
		if ( content ) {
			content = content.replace( /^\uFEFF/, '' )
		}
	} catch ( error ) {
		log.error( error )
		return null
	}

	const includePath = path.dirname( scriptPath )

	if ( content ) {
		const apiData = GetESDInterface().esdCompileToJSXBin(
			content,
			scriptPath,
			includePath
		)
		log.debug( 'Convert response', { apiData })

		if ( apiData.status === 0 ) {
			// Return data or output (from VS Code extension)
			return apiData.data || apiData.output
		}

		getESDError()
	}

	return null
}

let initialized = false

function initializeESDInterface() {
	if ( !initialized ) {
		// Pass required parameters for esdInitialize
		const initData = GetESDInterface().esdInitialize( 'jsxbin', process.pid )

		// Accept SUCCESS (0) or ALREADY_INITIALIZED (11)
		if ( initData.status === 0 || initData.status === 11 ) {
			initialized = true
		} else {
			getESDError()
		}
	}
}

module.exports = function convertScripts( input, output ) {
	log.verbose( 'Converting', { input, output })
	initializeESDInterface()
	for ( let i = 0; i < input.length; i++ ) {
		const scriptPath = input[i]
		const outputPath = output[i]
		const compiledContent = convertFileContents( scriptPath )
		if ( compiledContent ) {
			log.verbose( 'Writing', { outputPath, compiledContent })
			fs.writeFileSync( outputPath, compiledContent )
		} else {
			log.warn( `No compiled content found for '${scriptPath}'. Skipping.` )
		}
	}
}
