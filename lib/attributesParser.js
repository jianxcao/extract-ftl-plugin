var Parser = require("fastparse");

var processMatch = function(match, strUntilValue, name, value, index) {
	if(!this.isRelevantTagAttr(this.currentTag, name)) return;
	this.results.push({
		start: index + strUntilValue.length,
		length: value.length,
		value: value
	});
};

var parser = new Parser({
	outside: {
		"<!--.*?-->": true,
		// ftl注释不匹配
		"<#--.*?-->": true,
		"<![CDATA[.*?]]>": true,
		"<[!\\?].*?>": true,
		"<\/[^>]+>": true,
		"<([a-zA-Z\\-:]+)\\s*": function(match, tagName) {
			console.log('match tag')
			this.currentTag = tagName;
			return "inside";
		},
		// ftl规则解析
		"<#([a-zA-Z\\-:]+)\\s*": function(match, tagName) {
			console.log('match tag', match, tagName)
			this.currentTag = tagName;
			return "ftlTag";
		},
	},
	inside: {
		"\\s+": true, // eat up whitespace
		">": "outside", // end of attributes
		"(([0-9a-zA-Z\\-:]+)\\s*=\\s*\")([^\"]*)\"": processMatch,
		"(([0-9a-zA-Z\\-:]+)\\s*=\\s*\')([^\']*)\'": processMatch,
		"(([0-9a-zA-Z\\-:]+)\\s*=\\s*)([^\\s>]+)": processMatch
	},
	ftlTag: {
		">": "outside", // end of attributes
		"\"": function (...arg) {
			console.log(arg);
		}
	}
});

function parse(html, isRelevantTagAttr) {
	return parser.parse("outside", html, {
		currentTag: null,
		results: [],
		isRelevantTagAttr: isRelevantTagAttr
	}).results;
};

console.log(parse(`<#include 'test'/>`, function (tag, name) {
		console.log(tag, name)
}));

module.exports = parse;
