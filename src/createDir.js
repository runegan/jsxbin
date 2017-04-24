const path = require( 'path' )
const mkdirp = require( 'mkdirp' )

const log = require( './logger' )

module.exports = function createDirs( pathsToCreate ) {
	if ( !Array.isArray( pathsToCreate ) ) {
		return createDir( pathsToCreate )
	}

	pathsToCreate.map( createDir )

	return Promise.all( pathsToCreate )
}


function createDir( pathToCreate ) {
	return new Promise( ( resolve, reject ) => {
		log.debug( 'creating output dir', pathToCreate )

		// Check if it is a file or a direcory
		if ( /\.jsxbin$/.test( pathToCreate ) ) {

			// If it is a file, get the parent folder
			log.debug( 'Is not dir', pathToCreate )
			pathToCreate = path.dirname( pathToCreate )
		}

		// Create the output directory, and any directories that do not exist
		log.verbose( 'Creating output directory', pathToCreate )
		mkdirp( pathToCreate, err => {
			if ( err ) {
				return reject( err )
			}
			resolve()
		} )
	} )
}
