const path = require("path");
const indexHtml = path.join(__dirname, "app", "index.html");

const fileLoader = {
		loader: "file-loader"
};

module.exports = {
		entry: [// path.join(__dirname, "app", "main.js"),
				indexHtml],
		output: {
				path: path.join(__dirname, "dist"),
				filename: "bundle.js"
		},
		module: {
				rules: [
						{
								test: indexHtml,
								use: [
										{
												loader: "file-loader",
												options: {
														name: '[name].[ext]'
												}
										}, {
												loader: "extract-loader"
										}, {
												loader: "html-loader",
												options: {
														attrs: ["img:src", "link:href"]
												}
										}
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
