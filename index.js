/**
 *  ftl扩展插件
 *  主要功能 include和import路径补全
 *  用指定正则方法获取url，并加入监控补全url
 *  ftl源路径导出
 *  img link script等文件路径补全类似于  html-loader插件
 * 
 *  使用方法请看examples
 * 
 * 
 */
const ftl = /\.ftl$/;
const path = require('path');
function ExtractFtlPlugin (options) {
	this.options = Object.assign(options, {
		showErrors: true
	});
}
// plugin入口
ExtractFtlPlugin.prototype.apply = function (compiler) {
	// 编译已经完成，提取所有得ftl文件
	compiler.plugin('compilation', function (compilation) {
		let files = compilation.files;
		compilation.plugin('optimize-assets', function(assets, callback) {
			// assets = assets.filter(cur => ftl.test(cur));
			// 取到所有得入口点过滤
			let entries = this.entries;
			// 文件生成入口
			// let assets = this.assets;
			let chunks = this.chunks;
			// 循环所有得chunk, 找到入口的ftl文件
			chunks.map(chunk => {
				// 找到入口模块
				let entryModule = chunk.entryModule;
				if (!entryModule) {
					return;
				}
				let entryRequest = entryModule.rawRequest;
				if (!entryRequest) {
					return;
				}
				// 如果是ftl文件为入口
				if (ftl.test(entryRequest)) {
					let files = chunk.files;
					files.forEach(file => {
						// ftl的生成文件
						if (assets[file]) {
							// 取当前ftl模块的内容
						}
					});
				}
			});
			callback();
		});	
	});
}

// loader入口
ExtractFtlPlugin.extract = function (options) {
	return {
		loader: require.resolve('./lib/loader'), 
		options: options
	}
}
module.exports = exports = ExtractFtlPlugin;
