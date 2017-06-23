var webpack = require('webpack');
var cfg = require('./webpack.config.js')
webpack(cfg, (err, stats) => {
      if (err) {
        console.error(err);
      }
		console.log(stats.toString({
			chunks: false,
			colors: true,
		}));
 });

