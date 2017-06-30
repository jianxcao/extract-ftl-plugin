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
const extractLoader = require('./extractLoader');
function randomIdent() {
	return "xxxHTMLLINKxxx" + Math.random() + Math.random() + "xxx";
}

function getLoaderConfig(context) {
	let query = loaderUtils.getOptions(context) || {};
	let configKey = query.config || 'ftlLoader';
	let config = context.options && context.options.hasOwnProperty(configKey) ? context.options[configKey] : {};

	delete query.config;

	return assign(query, config);
}
// 是否忽略
function isIgnore (ignore, link) {
		if (ignore && typeof ignore === 'object' && ignore.length && link) {
			return ignore.some (cur => cur.test ? cur.test(link) : false);
		}
}
//自定义loader
function getloader (loaders, request) {
	let result = [];
	for (loader of loaders) {
		if (loader && typeof loader.test && loader.loader) {
			if (loader.test === request || (typeof loader.test.test === 'function' && loader.test.test(request))) {
				let t = typeof loader.loader;
				if (t === 'string') {
					let l = loader.loader.split('!');
					if (l.length) {
						result = result.concat(loader.loader.split('!').filter(cur => cur !== ''));
					}
				}
			}
		}
	}
	console.log("res", result);
	return result;
};

module.exports = function(content) {
	this.cacheable && this.cacheable();
	let config = getLoaderConfig(this);
	let loaders;
	if (config.loaders || config.rules) {
		loaders = config.loaders || config.rules;
	}
	if (!Array.isArray(loaders)) {
		throw new Error('loaders type is must array');
	}
	let attributes = ["img:src"];
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
	let root = config.root;
	let links = attrParse(content, function(tag, attr) {
		// ftl tag 处理
		if (tag === 'include' || tag === 'import') {
			return attributes.indexOf(tag) >= 0;
		}
		return attributes.indexOf(tag + ":" + attr) >= 0;
	});
	links.reverse();
	let data = {};
	content = [content];
	links.forEach(function(link) {
		if(!loaderUtils.isUrlRequest(link.value, root) || isIgnore(config.ignoreCustomFragments, link.value)) {
			return;
		}
		let uri = url.parse(link.value);
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
		let ident;
		do {
			ident = randomIdent();
		} while(data[ident]);

		data[ident] = link.value;
		let x = content.pop();
		content.push(x.substr(link.start + link.length));
		content.push(ident);
		content.push(x.substr(0, link.start));
	});
	content.reverse();
	content = content.join("");

	// 自定义规则实现 - 规则 方法
	if (config.replace && typeof config.replace === 'function'){
		// 给用户content去取规则
		let rule = config.replace.call(this, content);
		if (Array.isArray(rule)) {
			rule = rule.filter(cur => {
				// 必须有 value和start属性
				if (cur && cur.value) {
					cur.start = +cur.start;
					if (cur.start > 0) {
						cur.length = cur.length || cur.value.length;
						return true;
					}
				}
			})
			// 根据start排序
			.sort((a, b) => a.start < b.start);
			content = [content];
			rule.forEach(function(link) {
				if (!loaderUtils.isUrlRequest(link.value, root) || isIgnore(config.ignoreCustomFragments, link.value)) {
						return;
				} 
				let uri = url.parse(link.value);
				if (uri.hash !== null && uri.hash !== undefined) {
						uri.hash = null;
						link.value = uri.format();
						if (link.value) {
								link.length = link.value.length;
						}
				}
				let ident;
				do {
					ident = randomIdent();
				} while(data[ident]);

				data[ident] = link.value;
				let x = content.pop();
				content.push(x.substr(link.start + link.length));
				content.push(ident);
				content.push(x.substr(0, link.start));
			});
			content.reverse();
			content = content.join("");
		}
	}

	if (config.interpolate === 'require'){
		let reg = /\$\{require\([^)]*\)\}/g;
		let result;
		let reqList = [];
		while(result = reg.exec(content)){
			reqList.push({
				length : result[0].length,
				start : result.index,
				value : result[0]
			})
		}
		reqList.reverse();
		content = [content];
		reqList.forEach(function(link) {
			let x = content.pop();
			let ident;
			do {
				ident = randomIdent();
			} while(data[ident]);
			data[ident] = link.value.substring(11,link.length - 3)
			content.push(x.substr(link.start + link.length));
			content.push(ident);
			content.push(x.substr(0, link.start));
		});
		content.reverse();
		content = content.join("");
	}

	if(config.interpolate && config.interpolate !== 'require') {
		content = compile('`' + content + '`').code;
	} else {
		content = JSON.stringify(content);
	}
	
  let exportsString = "module.exports = ";
	if (config.exportAsDefault) {
        exportsString = "exports.default = ";

	} else if (config.exportAsEs6Default) {
        exportsString = "export default ";
	}
 	let result = exportsString + content.replace(/xxxHTMLLINKxxx[0-9\.]+xxx/g, function(match) {
		let res = data[match];
		if(!res) return match;
		// 如果是以！开始
		if (/^!/.test(res)) {
			res = res.split('!');
			let request = loaderUtils.urlToRequest(res[res.length - 1], root);
			res[res.length - 1] = request;
			res = res.join('!');
		} else {
			let request = loaderUtils.urlToRequest(res, root);
			let l = getloader(loaders, res);
			l = l.length ? l.join('!') : "";
			res = l ? `!${l}!${request}` : request;
		}
		return '" + require(' + JSON.stringify(res) + ') + "';
	}) + ";";
	extractLoader.call(this, result);
}
