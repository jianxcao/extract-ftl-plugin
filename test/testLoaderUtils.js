const loaderUtils = require("loader-utils");

const url = "~path/to/module.js";
const root = "src";
const request = loaderUtils.urlToRequest(url, root); // "path/to/module.js"
console.log(request);
console.log(loaderUtils.urlToRequest('/path/to/module.js', root));
// 会转换成相对路径在加上root
console.log(loaderUtils.urlToRequest('path/to/module.js', root));
