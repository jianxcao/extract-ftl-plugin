// 修改自 html-loader 
// author github page https://github.com/webpack-contrib/html-loader
// loader调用

const htmlMinifier = require("html-minifier");
const attrParse = require("./attributesParser");
const loaderUtils = require("loader-utils");
const url = require("url");
const assign = Object.assign;
const compile = require("es6-templates").compile;

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
	// 增加选项ftlRoot，因为ftl文件目录结构不能和css，js目录结构相混合，所以这里单独有个root
	var ftlRoot = config.ftlRoot;
	var links = attrParse(content, function(tag, attr) {
		return attributes.indexOf(tag + ":" + attr) >= 0;
	});
	links.reverse();
	var data = {};
	content = [content];
	links.forEach(function(link) {
		if(!loaderUtils.isUrlRequest(link.value, root)) return;

		var uri = url.parse(link.value);
		if (uri.hash !== null && uri.hash !== undefined) {
			uri.hash = null;
			link.value = uri.format();
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

	if (config.interpolate === 'require'){

		var reg = /\$\{require\([^)]*\)\}/g;
		var result;
		var reqList = [];
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
			var x = content.pop();
			do {
				var ident = randomIdent();
			} while(data[ident]);
			data[ident] = link.value.substring(11,link.length - 3)
			content.push(x.substr(link.start + link.length));
			content.push(ident);
			content.push(x.substr(0, link.start));
		});
		content.reverse();
		content = content.join("");
	}

	if(typeof config.minimize === "boolean" ? config.minimize : this.minimize) {
		var minimizeOptions = assign({}, config);

		[
			"removeComments",
			"removeCommentsFromCDATA",
			"removeCDATASectionsFromCDATA",
			"collapseWhitespace",
			"conservativeCollapse",
			"removeAttributeQuotes",
			"useShortDoctype",
			"keepClosingSlash",
			"minifyJS",
			"minifyCSS",
			"removeScriptTypeAttributes",
			"removeStyleTypeAttributes",
		].forEach(function(name) {
			if(typeof minimizeOptions[name] === "undefined") {
				minimizeOptions[name] = true;
			}
		});

		content = htmlMinifier.minify(content, minimizeOptions);
	}

	if(config.interpolate && config.interpolate !== 'require') {
		content = compile('`' + content + '`').code;
	} else {
		content = JSON.stringify(content);
	}

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
