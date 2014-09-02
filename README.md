
# typescript-compile

����node.js�е��õ� typescript ������

## TSCompile( *filepath*, *setting* )

### ����˵��

##### *filepath* ������Ҫ��������ļ���filepath Ҳ����ֱ�ӽ��ܲ���Դ���루�ַ������ݣ�, *����*

##### *setting* ��������ѡ�*��ѡ*

	JSON ��ʽ���ܵ�������
    	
	var TSCompile = require("typescript-compile");
	{
		out            : String, //����ļ�·����ע��typescript-compile�����Լ�����������
		module         : Enum(commonjs, amd), //ָ��Դ����ʹ�õ�ģ�������
		target         : Enum(ES3, ES5), //ָ��Դ��������������԰汾
		noImplicitAny  : Boolean, // Warn on expressions and declarations with an implied 'any' type.
		removeComments : Boolean, // ɾ��Ŀ������ϵ�ע��
		noLib          : Boolean, //������TypescriptĬ�ϵ�����������
		root           : String, //ָ��Դ��������Ŀ¼
		file           : String, //ָ��Դ������ļ���
		nodejs         : Boolea //Դ�����Ƿ�Ϊnode.js�������еĴ��룬����ǣ�����Զ���������node.js�ӿڵ������ļ�
	}


	String ��ʽ���ܵ�������
    
    "--out xxx.js --module commonjs --target ES3 --noImplictAny --removeComments --noLib --root xxx --file xxx --nodejs"
    
    ���������Ϊ��ѡ
    
### ����ֵ

	{
        path       : String, //���·��
        code       : String, //������Ŀ����� 
        referenced : Object, //Դ����ģ��������ģ���б�
        compiler   : Compile //����������
    }

## ʹ�÷�ʽ

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
	

