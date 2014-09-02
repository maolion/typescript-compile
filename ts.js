/***
 * TypeScript Compile
 * ----------------------------------------------------------------------------
 * <typescript-compile.js> - 2014/7/26
 * @version 0.0.1
 * @author  Joye, maolion.j@gmail.com
 * @website http://maolion.com
 */
 
'use strict';


var 
    Fs   = require("fs"),
    Path = require("path"),
    VM   = require("vm")
;
var 
    TS_MOD_FILE = require.resolve("typescript"),
    TS_MOD_DIR  = Path.dirname(TS_MOD_FILE),
    TMP         = require.resolve(TS_MOD_DIR + '/lib.d.ts')
;

var 
    sandbox  = { expTypeScript : null },
    contents = '(function(){'
             +      Fs.readFileSync(TS_MOD_FILE, "utf8")
             + '    expTypeScript = TypeScript;'
             + '}).call({});'
;

VM.runInNewContext(contents, sandbox, 'ts.vm');
var TypeScript = module.exports = sandbox.expTypeScript;



TypeScript.LIB_DPATH      = TMP;
TypeScript.COMMONJS_DPATH = require("path").resolve(__dirname, "./definitions/commonjs.d.ts");
TypeScript.NODEJS_DPATH   = require("path").resolve(__dirname, "./definitions/node.d.ts");
