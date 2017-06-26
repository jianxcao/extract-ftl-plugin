const path = require("path");
const indexFtl = path.join(__dirname, "app", "index.ftl");
const extractFtl = require('../../index').extract;
const fileLoader = {
		loader: "file-loader"
};
console.log(indexFtl);
module.exports = {
		entry: [
				//  path.join(__dirname, "app", "main.js"),
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
											root: 'test',
											attrs: ["img:src", "link:href", "include", 'import']
										})
								]
						}, {
								test: /\.css$/,
								use: [{
										loader: "file-loader",
										options: {
											name: '[path][name].[hash].[ext]'
										}
									},{
										loader: "extract-loader",
									},{
										loader:  "css-loader"
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
