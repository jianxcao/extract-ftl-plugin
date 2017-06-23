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
				filename: "bundle.js"
		},
		module: {
				rules: [
						{
								test: indexFtl,
								use: [
										{
												loader: "file-loader",
												options: {
														name: '[name].[ext]'
												}
										}, {
												loader: "extract-loader"
										},
										extractFtl({
											attrs: ["img:src", "link:href"]
										})
								]
						}, {
								test: /\.css$/,
								loader: ["file-loader", "extract-loader", "css-loader"]
						}, {
								test: /\.jpg$/,
								loader: "file-loader"
						}
				]
		}
};
