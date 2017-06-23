var Parser = require("fastparse");
var parse = new Parser({
	a: {
		"<!--.*?-->": true,
		"aaa(.*)": function (match, first, index) {
			this.result.push("true" + first)
		}
	}
});

var result = parse.parse("a", `
	<!--aaaffbbb-->
	aaaaaabbb,
	aaaccc,
	<include "test" />
`, {
	result: []
}).result;

console.log(result);

const sourceCode = "\\* @licence aaaa";
// A simple parser that extracts @licence ... from comments in a JS file
var parser = new Parser({
	// The "source" state
	"source": {
		// matches comment start
		"/\\*": "comment",
		"//": "linecomment",
		
		// this would be necessary for a complex language like JS
		// but omitted here for simplicity
		// "\"": "string1",
		// "\'": "string2",
		// "\/": "regexp"
		
	},
	// The "comment" state
	"comment": {
		"\\*/": "source",
		"@licen[cs]e\\s((?:[^*\n]|\\*+[^*/\n])*)": function(match, licenseText) {
			this.licences.push(licenseText.trim());
		}
	},
	// The "linecomment" state
	"linecomment": {
		"\n": "source",
		"@licen[cs]e\\s(.*)": function(match, licenseText) {
			this.licences.push(licenseText.trim());
		}
	}
});

var licences = parser.parse("source", sourceCode, { licences: [] }).licences;

// console.log(licences);
