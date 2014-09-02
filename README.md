
# typescript-compile

可在node.js中调用的 typescript 编译器

## TSCompile( *filepath*, *setting* )

### 参数说明

##### *filepath* 传入需要被编译的文件名filepath 也可以直接接受插入源代码（字符串数据）, *必须*

##### *setting* 编译配置选项，*可选*

	JSON 格式接受的配置项
    	
	var TSCompile = require("typescript-compile");
	{
		out            : String, //输出文件路径，注：typescript-compile不会自己完成这个操作
		module         : Enum(commonjs, amd), //指明源代码使用的模块管理方案
		target         : Enum(ES3, ES5), //指明源代码基于哪种语言版本
		noImplicitAny  : Boolean, // Warn on expressions and declarations with an implied 'any' type.
		removeComments : Boolean, // 删除目标代码上的注释
		noLib          : Boolean, //不引用Typescript默认的语言声明库
		root           : String, //指定源代码所在目录
		file           : String, //指定源代码的文件名
		nodejs         : Boolea //源代码是否为node.js环境运行的代码，如果是，则会自动包含关于node.js接口的声明文件
	}


	String 格式接受的配置项
    
    "--out xxx.js --module commonjs --target ES3 --noImplictAny --removeComments --noLib --root xxx --file xxx --nodejs"
    
    所有配置项都为可选
    
### 返回值

	{
        path       : String, //输出路径
        code       : String, //编译后的目标代码 
        referenced : Object, //源代码模块依赖的模块列表
        compiler   : Compile //编译器对象
    }

## 使用方式

	var TSCompile = require("typescript-compile");
    
    console.log(
    	TSCompile('./a.ts').code
    );
    console.log(
    	TSCompile('./a.ts', '--out xxx.js').code
    );
    console.log(
    	TSCompile('./a.ts', {out: "xxx.js"}).code
    );
    var source = 'class X{\n'
               + '  constructor(){\n'
               + '      console.log("hello,world");'
               + '  }\n'
               + '}'
    ;
   	var code = TSCompile(source).code;
    var code = TSCompile(source,  {out:"xxx.js", file : "xxx.ts"}).code
	

