var path = require('path');
var webpack = require('webpack');

module.exports = {
    context: __dirname,
    entry: [
        'webpack-dev-server/client?http://localhost:5709',
        'webpack/hot/only-dev-server',
        './src/scripts/main.jsx'
    ],
    output: {
        path: path.join(__dirname, 'lib'),
        filename: 'bundle.js',
        publicPath: '/assets/'
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