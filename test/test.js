const fs = require( 'mz/fs' )
const path = require( 'path' )
const assert = require( 'assert' )
const jsxbin = require( '../' )
const rimraf = require( 'rimraf' )

describe( 'jsxbin', function () {
	// ExtendScript Toolkit takes a while to convert files, so increate timeout
	this.timeout( 12000 )

	const outputDir = path.join( __dirname, 'output' )
	const inputDir = path.join( __dirname, 'testfiles' )
	const inputDir2 = path.join( __dirname, 'testfiles2' )

	function cleanup( done ) {
		rimraf( outputDir, () => {
			done()
		})
	}

	beforeEach( 'Delete outputdir', cleanup )

	it( 'creates given filename in output', function () {
		const output = path.join( outputDir, 'test1.jsxbin' )
		return jsxbin( path.join( inputDir, 'test1.jsx' ), output )
			.then( () => fs.access( output ) )
	})

	it( 'works when no output is given with a single file', function () {
		const output = path.join( inputDir, 'test1.jsxbin' )
		return jsxbin( path.join( inputDir, 'test1.jsx' ) )
			.then( () => fs.access( output ) )
	})

	it( 'creates one file with input filename in output directory', function () {
		return jsxbin( path.join( inputDir, 'test1.jsx' ), outputDir ).then( () => {
			const expectedOutputFile = path.join( outputDir, 'test1.jsxbin' )
			return fs.accessSync( expectedOutputFile )
		})
	})

	it( 'creates two files with input filenames in output directory', function () {
		const input = [
			path.join( inputDir, 'test1.jsx' ),
			path.join( inputDir, 'test2.jsx' )
		]
		return jsxbin( input, outputDir ).then( () => {
			const expectedOutputFile = path.join( outputDir, 'test1.jsxbin' )
			return fs.accessSync( expectedOutputFile )
		}).then( () => {
			const expectedOutputFile = path.join( outputDir, 'test2.jsxbin' )
			return fs.accessSync( expectedOutputFile )
		})
	})

	it( 'creates files in output dir when passed glob', function () {
		return jsxbin( `${inputDir}/*.jsx`, outputDir ).then( () => {
			const expectedOutputFile = path.join( outputDir, 'test1.jsxbin' )
			return fs.accessSync( expectedOutputFile )
		}).then( () => {
			const expectedOutputFile = path.join( outputDir, 'test2.jsxbin' )
			return fs.accessSync( expectedOutputFile )
		})
	})

	it( 'returns a list of files it has created', function () {
		const input = [
			path.join( inputDir, 'test1.jsx' ),
			path.join( inputDir, 'test2.jsx' )
		]

		const expectedOutput = [
			path.join( outputDir, 'test1.jsxbin' ),
			path.join( outputDir, 'test2.jsxbin' )
		]

		return jsxbin( input, outputDir ).then( output => {
			assert.deepEqual( output, expectedOutput, 'output == expectedOutput' )
		})
	})

	it( 'works when there are spaces in the filename', function () {
		const input = path.join( inputDir, 'test space 1.jsx' )
		return jsxbin( input, outputDir ).then( () => {
			const expectedOutputFile = path.join( outputDir, 'test space 1.jsxbin' )
			return fs.accessSync( expectedOutputFile )
		})
	})

	it( 'works when files use #include', function () {
		const input = path.join( inputDir, 'testInclude.jsx' )
		return jsxbin( input, outputDir ).then( () => {
			const expectedOutputFile = path.join( outputDir, 'testInclude.jsxbin' )
			return fs.accessSync( expectedOutputFile )
		})
	})

	it( 'works when files use #include in two directories', function () {
		const input = [
			path.join( inputDir, 'testInclude.jsx' ),
			path.join( inputDir2, 'testInclude2.jsx' )
		]

		const expectedOutput = [
			path.join( outputDir, 'testInclude.jsxbin' ),
			path.join( outputDir, 'testInclude2.jsxbin' )
		]

		return jsxbin( input, outputDir ).then( () => {
			expectedOutput.forEach( f => fs.accessSync( f ) )
		})
	})

	it( 'works when passing an array as output', function () {
		const input = [
			path.join( inputDir, 'test1.jsx' ),
			path.join( inputDir, 'test2.jsx' )
		]

		const expectedOutput = [
			path.join( outputDir, 'test1.jsxbin' ),
			path.join( outputDir, 'test2.jsxbin' )
		]

		return jsxbin( input, expectedOutput ).then( output => {
			assert.deepEqual( output, expectedOutput, 'output == expectedOutput' )
		})
	})

	it( 'creates jsxbin file in the same place as the input when no output is given', function () {
		const input = [
			path.join( inputDir, 'test1.jsx' ),
			path.join( inputDir, 'test2.jsx' )
		]

		const expectedOutput = [
			path.join( inputDir, 'test1.jsxbin' ),
			path.join( inputDir, 'test2.jsxbin' )
		]

		return jsxbin( input, expectedOutput ).then( output => {
			assert.deepEqual( output, expectedOutput, 'output == expectedOutput' )
			output.forEach( fs.unlinkSync )
		})
	})

	it( 'works when only passed a glob', function () {
		const expectedOutput = [
			path.join( inputDir, 'test1.jsxbin' ),
			path.join( inputDir, 'test2.jsxbin' )
		]

		return jsxbin( `${inputDir}/*.jsx` ).then( output => {
			expectedOutput.forEach( f => fs.accessSync( f ) )
			output.forEach( fs.unlinkSync )
		})
	})

	it( 'works when passing in an options object', function () {
		return jsxbin({ input: path.join( inputDir, 'test1.jsx' ), output: outputDir }).then( () => {
			const expectedOutputFile = path.join( outputDir, 'test1.jsxbin' )
			return fs.accessSync( expectedOutputFile )
		})
	})

	it( 'works when passing in an options object without output', function () {
		return jsxbin({ input: path.join( inputDir, 'test1.jsx' ) }).then( () => {
			const expectedOutputFile = path.join( inputDir, 'test1.jsxbin' )
			return fs.accessSync( expectedOutputFile )
		})
	})
})
