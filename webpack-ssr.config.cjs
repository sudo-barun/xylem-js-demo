const path = require('path');

const entryFiles = [
	'gallery',
];

module.exports = {
	// devtool: 'inline-source-map',
	devtool: false,
	mode: 'development',
	entry: entryFiles.reduce((acc,file)=>{
		acc[file] = [
			`./demos-ssr/${file}.js`,
		];
		return acc;
	}, {}),
	output: {
		filename: '[name].bundle.js',
		path: path.resolve(__dirname, 'demos-ssr/'),
		environment: {
			arrowFunction: false
		},
	},
	module: {
		rules: [
			{
				test: /\.m?js$/,
				exclude: /node_modules\/(?!(axios))/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: [
							[
								'@babel/preset-env',
								{
									targets: "ie 9"
								}
							]
						]
					}
				}
			}
		]
	}
};
