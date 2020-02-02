const path = require('path');
const webpack = require('webpack');

module.exports = {
	entry: ['./src/index.jsx'],
	output: {
		path: path.join(path.resolve(__dirname), '..'),
		filename: 'bundle.js',
	},
	resolve: {
		extensions: ['.js', '.jsx', '.css'],
	},
	module: {
		rules: [
			{
				test: /\.(js|jsx)?$/,
				exclude: /node_modules/,
				loader: 'babel-loader',
				query: {
                    presets: ['@babel/preset-env', '@babel/preset-react'],
                    plugins: [['@babel/plugin-proposal-class-properties']]
				},
			},
			{
				test: /\.css$/,
				use: ['style-loader', 'css-loader'],
			},
		],
	},
	plugins: [new webpack.NamedModulesPlugin()],
};
