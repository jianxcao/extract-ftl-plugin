// 修改自 html-loader 
// author github page https://github.com/webpack-contrib/html-loader
// loader调用

const htmlMinifier = require("html-minifier");
const attrParse = require("./attributesParser");
const loaderUtils = require("loader-utils");
const url = require("url");
const assign = Object.assign;
const compile = require("es6-templates").compile;
const isUU = /^[^./]/;
function randomIdent() {
	return "xxxHTMLLINKxxx" + Math.random() + Math.random() + "xxx";
}

function getLoaderConfig(context) {
	var query = loaderUtils.getOptions(context) || {};
	var configKey = query.config || 'htmlLoader';
	var config = context.options && context.options.hasOwnProperty(configKey) ? context.options[configKey] : {};

	delete query.config;

	return assign(query, config);
}
// 是否忽略
function isIgnore (ignore, url) {
		if (ignore && typeof ignore === 'object' && ignore.length && url) {
			return ignore.some (cur => cur.test ? cur.test(url) : false);
		}
}

module.exports = function(content) {
	this.cacheable && this.cacheable();
	var config = getLoaderConfig(this);
	var attributes = ["img:src"];
	if(config.attrs !== undefined) {
		if(typeof config.attrs === "string")
			attributes = config.attrs.split(" ");
		else if(Array.isArray(config.attrs))
			attributes = config.attrs;
		else if(config.attrs === false)
			attributes = [];
		else
			throw new Error("Invalid value to config parameter attrs");
	}
	var root = config.root;
	var links = attrParse(content, function(tag, attr) {
		// ftl tag 处理
		if (tag === 'include' || tag === 'import') {
			return attributes.indexOf(tag) >= 0;
		}
		return attributes.indexOf(tag + ":" + attr) >= 0;
	});
	links.reverse();
	var data = {};
	content = [content];
	links.forEach(function(link) {
		if(!loaderUtils.isUrlRequest(link.value, root) || 
		isIgnore(config.ignoreCustomFragments, link.value)) return;
		var uri = url.parse(link.value);
		if (uri.hash !== null && uri.hash !== undefined) {
			uri.hash = null;
			link.value = uri.format();
			if (link.value) {
				link.length = link.value.length;
			}
		}
		// 类似这种 core/core.ftl转换成 ~core/core.ftl表示是公共模块中获取资源
		if (isUU.test(link.value)) {
			link.value = "~" + link.value;
			// 修正成都
			link.length = link.value.length;
		}
		do {
			var ident = randomIdent();
		} while(data[ident]);

		data[ident] = link.value;
		var x = content.pop();
		content.push(x.substr(link.start + link.length));
		content.push(ident);
		content.push(x.substr(0, link.start));
	});
	content.reverse();
	content = content.join("");

	// 自定义规则实现 
	if (config.selfRule && config.selfRule.length){
		var result;
		var reqList = [];
		config.selfRule.forEach(cur => {
			if(!loaderUtils.isUrlRequest(link.value, root)) return;

		});
		reqList.reverse();
		content = [content];
		reqList.forEach(function(link) {
			var x = content.pop();
			do {
				var ident = randomIdent();
			} while(data[ident]);
			content.push(x.substr(link.start + link.length));
			content.push(ident);
			content.push(x.substr(0, link.start));
		});
		content.reverse();
		content = content.join("");
	}

	content = JSON.stringify(content);
	
  var exportsString = "module.exports = ";
	if (config.exportAsDefault) {
        exportsString = "exports.default = ";

	} else if (config.exportAsEs6Default) {
        exportsString = "export default ";
	}

 	return exportsString + content.replace(/xxxHTMLLINKxxx[0-9\.]+xxx/g, function(match) {
		if(!data[match]) return match;
		return '" + require(' + JSON.stringify(loaderUtils.urlToRequest(data[match], root)) + ') + "';
	}) + ";";
}
