const path = require('path');

const entryFiles = [
	'autocomplete',
	'counter',
	'dynamic-title',
	'form',
	'gallery',
	'invoice',
	'resume',
	'todo-list',
	'tri-state-checkbox',
	'wiggle',
	'wysiwyg',
];

module.exports = {
	// devtool: 'inline-source-map',
	devtool: false,
	mode: 'development',
	entry: entryFiles.reduce((acc,file)=>{
		acc[file] = [
			'core-js/es/promise/index',
			// 'core-js',
			`./demos/${file}.js`,
		];
		return acc;
	}, {}),
	output: {
		filename: '[name].bundle.js',
		path: path.resolve(__dirname, 'demos_bundled/'),
		environment: {
			arrowFunction: false
		},
	},
	module: {
		rules: [
			{
				test: /\.m?js$/,
				// exclude: /node_modules\/(?!(axios))/,
				// use: {
				// 	loader: 'babel-loader',
				// 	options: {
				// 		presets: [
				// 			[
				// 				'@babel/preset-env',
				// 				{
				// 					targets: "ie 8"
				// 				}
				// 			]
				// 		]
				// 	}
				// }
			}
		]
	}
};
