var path = require('path');
var webpack = require('webpack');

module.exports = {
    context: __dirname,
    entry: ['./src/index.js'],
    output: {
        path: path.join(__dirname, 'build'),
        filename: 'bundle.js'
    },
    //devtool: 'source-map',

    plugins: [
        new webpack.NoErrorsPlugin()
    ],
    resolve: {
        extensions: ['', '.js', '.jsx']
    },
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                loader: 'babel-loader',
                exclude: /node_modules/
            }
        ]
    }
};