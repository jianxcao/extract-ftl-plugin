#  ftl扩展插件
 ## 功能
1. include和import路径补全 (<#--注释中将被忽略-->)
2. 用指定正则方法获取url，并加入监控补全url
3. ftl源路径导出
4. img link script等文件路径补全类似于  html-loader插件
5. 使用方法请看examples


## loader使用

``` javascript
module.exports = {
		entry: [//  path.join(__dirname, "app", "main.js"),
				indexFtl],
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
												attrs: ["img:src", "link:href", "include", 'import'],
												// 自定义规则，可以根据项目需要替换项目中的某些url
												selfRule: [

												]
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

编译ftl中哪些地方的url，比如img的src属性 link的href属性

如： `["img:src", "img:data-src", "link:href", "include", 'import']` 

将会编译 img标签替换img标签src和data-src下的路径， 编译link标签替换link标签下的href路径,
编译include和import语法替换include和imprt下的路径


#### `root `
`boolean|string`

根路径设置，如果设置是string则会在`/`开头得路径前添加root路径，如果root设置成true，则认为路径是绝对路径,**特别注意，只有路径是以/开头的时候才生效**

#### `ignoreCustomFragments`
`array` 如： [/\{\{.*}}/, /\$\{.*\}/]
设置后凡是url中带有  {{}}和 ${}的一律忽略不去编译

####  `selfRule` 自定义匹配规则


## 其他
请看[examples](./examples)目录中得demo
