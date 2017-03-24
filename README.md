# jsxbin

Convert jsx ExtendScript files into jsxbin files using ExtendScript Toolkit (ESTK)

# Example

```javascript
const jsxbin = require( 'jsxbin' )

jsxbin( 'path/to/script.js', 'output/script.jsxbin' )
	.then( outputfiles => {
		console.log( 'Finished!' )
	} )
	.catch( err => {
		console.error( err )
	} )
```

(You have to have [ExtendScript Toolkit](http://www.adobe.com/products/extendscript-toolkit.html) installed for this package to work.)

# Methods

## jsxbin( inputPaths, outputPath )

`inputPaths` can be:

- String with path to jsx file. `script.jsx`
- String with glob pattern that matches jsx/js files. `*.jsx`
- Array of any of the above

`outputPath` can be:

- String path for what to name converted file. `path/to/script.jsxbin`
	- Should only be used when passing only one file as `inputPaths`
- String path to folder where converted file will be placed. `path/to/output`

`jsxbin` returns a promise with an array of file paths to the converted files

### Examples

```javascript
// Just one file
jsxbin( 'script.jsx', 'script.jsxbin' )

// Multiple files
jsxbin( [ 'script1.jsx', 'script2.jsx' ], 'output/' )

// Using glob string for input
jsxbin( 'src/*.jsx', 'output' )
```

# From the Command Line

This package also ships with a `jsxbin` command.

```
jsxbin

  usage: jsxbin -i file1.jsx, file2.jsx.. -o outputdir
  usage: jsxbin -i file1.jsx -o outputname.jsxbin

  Converts Extendscript .jsx files into jsxbin files using ExtendScript Toolkit

Options

  -i, --input   file(s)      The file or files to convert
  -o, --output  file|folder  The file or folder where the converted file will be placed
  -v, --verbose              Show more info while running
  --debug                    Show even more info while running
  -h, --help                 Show help
```

# Install

with npm do:

```
npm install jsxbin
```
to get the function, or

```
npm install jsxbin -g
```
to get the command.

# TODO

- [ ] Check if ESTK is installed and return the correct path to it
