const tmp = require( 'tmp-promise' )
const writeFile = require( 'fs' ).writeFile
const path = require( 'path' )

const log = require( './logger' )

module.exports = function generateScriptFiles( inputs, outputs ) {
	const list = generateInputList( inputs, outputs )

	const scripts = []

	Object.keys( list ).forEach( dir => {
		const { input, output } = list[dir]
		const script = generateScriptFile( dir, input, output )
		scripts.push( script )
	})

	return Promise.all( scripts )
}

function generateScriptFile( dir, input, output ) {
	// We need to create a temp file that ESTK can run, this file will have
	// all paths that are going to be converted
	return tmp.file({ dir, postfix: '.jsx' })

	// "tmp.file" returns an object with the more properties, but we are only
	// interested in the path property
	.then( ({ path: file }) => {
		log.verbose( 'Created temp file at', file )

		const script = createScriptContent( input, output )

		// Write script contents to temp file
		return new Promise( ( resolve, reject ) => {
			writeFile( file, script, err => {
				if ( err ) {
					return reject( err )
				}

				// Send file path to next function in the promise chain
				resolve( file )
			})
		})
	})
}

/**
 * Creates the build script for ESTK to create jsxbin files
 * @function createScriptContent
 * @param  {string[]}     input  Array of filepaths to convert
 * @param  {String[]}     output Array of filepaths with names of where to place
 *                               converted files, must be same length as input
 * @return {String}              The script to create jsxbin files
 */
function createScriptContent( input, output ) {
	const script = `#target estoolkit#dbg
	var input = ${JSON.stringify( input )};
	var output = ${JSON.stringify( output )};

	// Loop through the input files
	for ( var i = 0; i < input.length; i++ ) {
		var fileIn = new File( input[i] );

		// Assume the output array is same length as input array
		var fileOut = File( output[ i ] );
		exportJSXBIN( fileIn, fileOut );
	}
	function exportJSXBIN( fileIn, fileOut ) {

		// Get the original contents
		fileIn.open( "r" );
		var s = fileIn.read();
		fileIn.close();

		try {
			// Convert it to jsxbin format
			var t = app.compile( s );

			// Write it to output file
			fileOut.open( "w" );
			fileOut.write( t );
			fileOut.close();
		} catch ( err ) {
			alert( "Error!\\nFile: " + fileIn.fsName + "\\n" + err );
			return;
		}
	}`

	log.debug({ script })

	return script
}


function generateInputList( inputs, outputs ) {
	const dirs = {}
	inputs.forEach( ( input, index ) => {
		const dirname = path.dirname( input )
		if ( !dirs[dirname] ) {
			dirs[dirname] = {
				input: [],
				output: []
			}
		}
		const output = outputs[index]
		dirs[dirname].input.push( input )
		dirs[dirname].output.push( output )
	})

	return dirs
}
