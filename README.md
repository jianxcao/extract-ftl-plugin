#  ftl扩展插件
 ## 功能
1. include和import路径补全 (<#--注释中将被忽略--> (${reqire('module')})在开启interpolate时无法忽略)
2. ftl源路径导出
3. img link script等文件路径补全类似于  html-loader插件
4. 用自定义的规则，补全url (未实现)

## loader使用

``` javascript
module.exports = {
  entry: [indexFtl],
  output: {
    path: path.join(__dirname, "dist"),
    publicPath: "http://pimg1.126.net/",
    filename: "bundle.js"
  },
  context: path.join(__dirname, "app"),
  resolve: {
    modules: ["common", "node_modules"]
  },
  module: {
    rules: [
      {
        test: /\.ftl$/,
        use: [
          {
            loader: "file-loader",
            options: {
              publicPath: "",
              name: '[path][name].[ext]'
            }
          }, {
            loader: "extract-loader"
          },
          extractFtl({
            root: 'myroot',
            // 忽略所有的带 ${} 和 {{}}的不去编译
            ignoreCustomFragments: [/\{\{.*}}/, /\$\{.*\}/],
            attrs: ["img:src", "link:href", "include", 'import']
          })
        ]
      }, {
        test: /\.css$/,
        use: [
          {
            loader: "file-loader",
            options: {
              name: '[path][name].[hash].[ext]'
            }
          }, {
            loader: "extract-loader"
          }, {
            loader: "css-loader"
          }
        ]
      }, {
        test: /\.jpg$/,
        loader: "file-loader",
        options: {
          name: '[path][name].[hash].[ext]'
        }
      }
    ]
  }
};
			
```
### loader options

#### `attrs` 
`array|string`

编译ftl中的url，比如img的src属性 link的href属性

如： `["img:src", "img:data-src", "link:href", "include", 'import']` 

将会编译 img标签替换img标签src和data-src下的路径， 编译link标签替换link标签下的href路径,
编译include和import语法替换include和imprt下的路径


#### `root `
`boolean|string`

根路径设置，如果设置是string则会在`/`开头得路径前添加root路径，如果root设置成true，则认为路径是绝对路径,**特别注意，只有路径是以/开头的时候才生效**

#### `ignoreCustomFragments`
`array` 如： [/\{\{.*}}/, /\$\{.*\}/] (${reqire('module')})在开启interpolate时无法忽略
设置后凡是url中带有  {{}}和 ${}的一律忽略不去编译

#### interpolate
`require|boolean` 参数值可以  require或者 true|false

参数默认为false

参数为require时, 在页面中插入 ${require('file-loader!css-loader!main.css')};表示用file-loader!css-loader加载这个资源,可以在任意位置插入

参数为true时会将整个文件当做es6模板编译

####  `replace` 自定义匹配规则
`function` 要求function返回指定格式, function参数content
返回格式
``` javascript
	[{
		// 要替换的位置
		start: 3,
		// 要替换的值
		value: "/test"
	},{
		start: 3,
		value: "/test"
	}]
```
## 其他
请看[examples](./examples)目录中得demo
