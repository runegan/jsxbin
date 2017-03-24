const fs = require( 'mz/fs' )
const path = require( 'path' )
const assert = require( 'assert' )
const jsxbin = require( '../' )
const rimraf = require( 'rimraf' )

describe( 'jsxbin', function() {

	// ExtendScript Toolkit takes a while to convert files, so increate timeout
	this.timeout( 4000 )

	const outputDir = path.join( __dirname, 'output' )
	const inputDir = path.join( __dirname, 'testfiles' )

	function cleanup( done ) {
		rimraf( outputDir, () => {
			done()
		} )
	}

	beforeEach( 'Delete outputdir', cleanup )

	it( 'creates given filename in output', function() {
		const output = path.join( outputDir, 'test1.jsxbin' )
		return jsxbin( path.join( inputDir, 'test1.jsx' ), output )
			.then( () => fs.access( output ) )
	} )

	it( 'creates one file with input filename in output directory', function() {
		return jsxbin( path.join( inputDir, 'test1.jsx' ), outputDir ).then( () => {
			const expectedOutputFile = path.join( outputDir, 'test1.jsxbin' )
			return fs.accessSync( expectedOutputFile )
		} )
	} )

	it( 'creates two files with input filenames in output directory', function() {
		const input = [
			path.join( inputDir, 'test1.jsx' ),
			path.join( inputDir, 'test2.jsx' )
		]
		return jsxbin( input, outputDir ).then( () => {
			const expectedOutputFile = path.join( outputDir, 'test1.jsxbin' )
			return fs.accessSync( expectedOutputFile )
		} ).then( () => {
			const expectedOutputFile = path.join( outputDir, 'test2.jsxbin' )
			return fs.accessSync( expectedOutputFile )
		} )
	} )

	it( 'creates files in output dir when passed glob', function() {
		return jsxbin( `${inputDir}/*.jsx`, outputDir ).then( () => {
			const expectedOutputFile = path.join( outputDir, 'test1.jsxbin' )
			return fs.accessSync( expectedOutputFile )
		} ).then( () => {
			const expectedOutputFile = path.join( outputDir, 'test2.jsxbin' )
			return fs.accessSync( expectedOutputFile )
		} )
	} )

	it( 'returns a list of files it has created', function() {
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
		} )
	} )

	it( 'should work when there are spaces in the filename', function() {
		const input = path.join( inputDir, 'test1.jsx' )
		return jsxbin( input, outputDir ).then( () => {
			const expectedOutputFile = path.join( outputDir, 'test1.jsxbin' )
			return fs.accessSync( expectedOutputFile )
		} )
	} )

} )
