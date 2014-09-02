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
    TS   = require("./ts")
;



var Utils = function(){
    var Utils = {};
    
    Utils.mix = function(dest, sources) {
        var 
            sources = Array.prototype.slice.call(arguments, 1)
        ;
        if (!dest) return;
        if (!sources.length) return dest;
        for(var i = 0, l = sources.length; i < l; i++) {
            var source = sources[i];
            for(var k in source) {
                if (!source.hasOwnProperty(k)) continue;
                dest[k] = source[k];
            }
        }
        return dest;
    };

    return Utils;
}();

/**
    * TSCompile(filepath, setting)
    * @param {String} filepath 
    *
    * @param {JSON/String} setting 编译配置选项
    *  JSON 接受的配置项

    
    */
var Compile = module.exports = function(){

    var 
        DEF_SETTING = new TS.CompilationSettings(),
        UID     = new Date().getTime(),
        schema = {
            "--out"            : { type : String, target : "outFileOption" }, // Specify path to output file
            //"--outDir"         : { type : String, target : "outDirOption" }, //Specify path to output dir
            "--module"         : { type : String, target : "moduleGenTarget", 
                                    enum : { 
                                        default  : TS.ModuleGenTarget.Unspecified,
                                        commonjs : TS.ModuleGenTarget.Synchronous,
                                        amd      : TS.ModuleGenTarget.Asynchronous 
                                    } 
                                 }, // Specify module code generation: 'commonjs' or 'amd'
            "--target"         : { type : String, target : "codeGenTarget", 
                                    enum : {
                                        default : TS.LanguageVersion.EcmaScript3,
                                        ES3     : TS.LanguageVersion.EcmaScript3,
                                        ES5     : TS.LanguageVersion.EcmaScript5
                                    }
                                 }, // Specify ECMAScript target version: 'ES3' (default), or 'ES5'
            "--noImplicitAny"  : { type : Boolean, target : "noImplicitAny"}, // Warn on expressions and declarations with an implied 'any' type.
            //"--noResolve"      : { type : Boolean, target : "noResolve" }, // Skip resolution and preprocessing.
            "--removeComments" : { type : Boolean, target : "removeComments" }, // Do not emit comments to output.
            //"--sourcemap"      : { type : Boolean, target : "mapSourceFiles" },  //Generates corresponding .map file.
            "--noLib"          : { type : Boolean, target : "noLib" }, //Do not include default library
            //"--mapRoot"        : { type : String, target : "mapRoot" }, //Specifies the location where debugger should locate map files instead of generated locations.
            //"--sourceRoot"     : { type : String, target : "sourceRoot" } //Specifies the location where debugger should locate TypeScript files instead of source locations.
            "--root" : { type : String, target : "root" },
            "--file": { type: String, target: "file" },
            "--nodejs" : { type : Boolean, target : "nodejs" }
        }
    ;


    function normalizerCompilationSetting(args, filter) {
        var setting = Utils.mix({outFileOption:"code.js"}, DEF_SETTING);
        if (typeof args === "string" || args instanceof String) {
            args = args.split(/\s+/g);
            for(var i = 0, l= args.length; i < l; i ++) {
                var 
                    opt = args[i],
                    s   = schema[opt]
                ;
                if ( !schema.hasOwnProperty(opt) || (filter && filter.hasOwnProperty(opt.slice(2))) ) continue;
                if (s.type === String) {
                    var next = args[i+1];
                    if (next && schema.hasOwnProperty(opt)) {
                        setting[s.target] = s.enum ? s.enum.hasOwnProperty(next) ? s.enum[next] : s.enum.default : next;
                        i++;
                    }
                } else {
                    setting[s.target] = true;
                }
            }
        } else {
            for(var k in args) {
                var s = schema["--" + k];
                if ( !s || (filter && filter.hasOwnProperty(k)) ) continue;
                setting[s.target] = s.type === Boolean ? !!args[k] : 
                                        s.enum ?
                                            (s.enum.hasOwnProperty(args[k]) ? s.enum[args[k]] : s.enum.default) : args[k]

                ;
            }
        }
        return setting;

    }

    function CodeUnit(path, scriptSnapshot) {

        this.path           = path;
        this.scriptSnapshot = new TS.ScriptSnapshot.fromString(typeof scriptSnapshot === 'undefined' ? Fs.readFileSync(path, "utf8") : scriptSnapshot);
        this.references     = [];
        this.referenced     = {};
    }
    var referenceBaseLibUnit = function(){
        var 
            cache = {},
            libs  = [
                {
                    path : TS.LIB_DPATH,
                    when : function(setting) {
                        return !setting.noLib();
                    }
                },
                {
                    path : TS.COMMONJS_DPATH,
                    when: function (setting) {
                        return !setting.isNodeJs
                            && (setting.moduleGenTarget() === TS.ModuleGenTarget.Synchronous
                            || setting.moduleGenTarget() === TS.ModuleGenTarget.Asynchronous);
                    }
                },
                {
                    path: TS.NODEJS_DPATH,
                    when: function (setting) {
                        return setting.isNodeJs;
                    }
                }
            ]
        ;

        return function referenceBaseLibUnit(current, host) {

            for(var i = 0, l = libs.length; i < l; i++) {
                var 
                    lib  = libs[i],
                    unit = null
                ;

                if (!lib.when(host._setting)) continue;
                current.references.push(lib.path);
                unit = cache[lib.path] = cache[lib.path] || new CodeUnit(lib.path);
                host._compiler.addFile(unit.path, unit.scriptSnapshot, 3, 0, false, unit.references);
                current.referenced[unit.path] = unit;
            }
        }
    }();

    var 
        RE_REF_TAG  = /^\/{3}\s*<reference\s/i
    ;
    function resolve(current, host) {
        host._resolveCache[current.path] = current;

        referenceBaseLibUnit(current, host);

        var code = current.scriptSnapshot.text.replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*/g, function(match){
            return RE_REF_TAG.test(match) ? match : '';
        });

        var 
            re = /\/{3}\s*<reference\s+path\s*=\s*['"]([^'"]+?)['"]|\bimport\s+\w+\s*=\s*require\s*\(\s*['"]([^'"]+?)['"]\s*\)/ig,
            isDFile = /\.d\.ts$/i.test(current.path),
            RE_REQUIRE = /\bimport\s+\w+\s*=\s*require\s*\(\s*['"][^'"]+?['"]\s*\)/i,
            match = null
        ;

        while(match = re.exec(code)) {
            var 
                file = host.resolvePath(match[1]||match[2], Path.dirname(current.path)),
                unit = null
            ;
            if (isDFile && RE_REQUIRE.test(match[0])) {
                continue;
            }
            if (current.referenced.hasOwnProperty(file)) continue;
            if (match[2]) {
                if (current.referenced.hasOwnProperty(file + ".d.ts") || current.referenced.hasOwnProperty(file + ".ts")) continue;
                if (Fs.existsSync(file + ".ts")) {
                    file += ".ts";
                } else if(Fs.existsSync(file + ".d.ts")){
                    file += '.d.ts';
                } else {
                    continue;
                }
            }
            unit = host._resolveCache[file] || new CodeUnit(file);
            current.references.push(match[1]||match[2]);
            current.referenced[file] = unit;
            resolve(unit, host);
        }
        host._compiler.addFile(current.path, current.scriptSnapshot, 3, 0, false, current.references);
    }


    function C(code, setting) {
        var
            setting  = normalizerCompilationSetting(setting),
            __root   = setting.root,
            __file   = setting.file,
            __nodejs = setting.nodejs
        ;
        this._setting          = TS.ImmutableCompilationSettings.fromCompilationSettings(setting);
        this._setting.isNodeJs = __nodejs;
        this._references       = [];
        this._referenced       = {};
        this._resolveCache     = {};
        this._compiler         = new TS.TypeScriptCompiler(null, this._setting);
        this._root             = __root || Fs.realpathSync(".");
        var unit = /^[^\n]+\.ts$/i.test(code) ? new CodeUnit(this.resolvePath(code)) : new CodeUnit(__file || "~temp" + (UID++) + ".ts", code);
        this._references = unit.references;
        this._referenced = unit.referenced;
        resolve(unit, this);
    }

    var api = C.prototype;

    api.complie = function(){
        var last = null;
        for (var it = this._compiler.compile(function (path) {
            return path;
        }); it.moveNext();) {
            var result = it.current();
            if (result.diagnostics.length) {
                result.diagnostics.forEach(function(diagnostic){
                    //process.stderr.write
                    process.stderr.write(
                        diagnostic.message() + 
                        "\n\t" + diagnostic.fileName() + "(line:" + diagnostic.line() + ", char:" + diagnostic.start() + ")\n" 
                    );
                });
                return;
            }
            last = result;
        }
        if (!last) return;
        return last.outputFiles[last.outputFiles.length - 1].text;
    };

    api.resolvePath = function(path, root) {
        return Path.resolve(root||this._root, path);
    };

    api.getReferenced = function() {
        return this._referenced;
    };
    api.setting = function(){
        return this._setting;
    };
    return function Compile(code, setting){
        var compiler = new C(code, setting, root);
        return {
            path       : compiler.resolvePath(compiler.setting().outFileOption()),
            code       : compiler.complie(),
            referenced : compiler.getReferenced(),
            compiler   : compiler
        }
    };
}();
