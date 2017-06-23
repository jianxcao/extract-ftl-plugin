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
const plugin = require('./lib/plugin');

function ExtractFtlPlugin () {

}
// plugin入口
ExtractFtlPlugin.apply = function () {

}

// loader入口
ExtractFtlPlugin.extract = function (options) {
	return {
		loader: require.resolve('./lib/loader'), 
		options: options
	}
}
module.exports = exports = ExtractFtlPlugin;
