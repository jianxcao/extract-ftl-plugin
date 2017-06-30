const path = require("path");
const extractFtl = require('../../index').extract;
const ExtractFtlPlugin = require('../../index');
const webpack = require('webpack');
const fileLoader = {
		loader: "file-loader"
};
const replace = function (context) {
	let reg = /<#assign\s+loading1*\s*=\s*\[(.*)\]\s*/g;
	let nn = /["']([^'"]+)["']/g;
	let dou = /^["']|["']$/g;
	let res = null;
	let result = [];
	while(res = reg.exec(context)) {
		while(r = nn.exec(res[0])) {
			result.push({
				start: r.index + res.index + 1,
				value: r[1]
			});		
		}
	}
	return result;
}
module.exports = {
		entry: {
			"js/index": "./js/index.js",
			// ftl最好带上后缀防止与js文件同名-- 模板入口只能是单文件入口
			"index.ftl": "./index.ftl"
		},
		output: {
				path: path.join(__dirname, "dist"),
				publicPath: "http://pimg1.126.net/",
				filename: "[name].[chunkhash:10].js"
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
														publicPath: "/",
														name: '[path][name].[ext]'
												}
										},
										extractFtl({ // 将ftl编译成一个 js module
												// root: 'myroot',
												// publicPath: null,
												// 忽略所有的带 ${} 和 {{}}的不去编译
												ignoreCustomFragments: [/\{\{.*}}/, /\$\{.*\}/],
												interpolate: 'require',
												attrs: ["img:src", "link:href", "include", 'import'],
												// 通过replace函数替换 require
												replace: replace,
												//用指定 loader加载资源- 如果资源已经有loader则会放弃公共的loader
												rules: [{
													// test只能是正则，或者数组，或者string
													test: /\.css$/,
													loader: "!file-loader?name=[path][name].[hash].[ext]!css-loader"
												},{
													test: /core\.less$/,
													loader: "!raw-loader?name=[path][name].[hash].css!less-loader"
												},{
													test: /\.less$/,
													loader: "!file-loader?name=[path][name].[hash].css!less-loader"
												}]
										})
								]
						}, {
								test: /\.css$/,
								use: [{
												loader: "css-loader"
										}]
						},{
							test: /\.less$/,
							use: [{
									loader: "style-loader"
							},{
									loader: "css-loader"
							},{
								loader: 'less-loader'
							}]
						}, {
								test: /\.jpg$/,
								loader: "file-loader",
								options: {
										name: '[path][name].[hash].[ext]'
								}
						}
				]
		},
		plugins: [
			new ExtractFtlPlugin({
			}),
			new webpack.optimize.CommonsChunkPlugin({
				names: ['vendor', 'manifest']
			})
		]
};
