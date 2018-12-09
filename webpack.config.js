const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = {
    entry: './src/app.js',
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'dist')
    },
    module: {
        rules: [{
            test: /\.css$/,
            use: [{
                loader: 'style-loader'
            }, {
                loader: 'css-loader',
                options: {
                    // prevents uglification of classes
                    modules: false
                }
            }],
        }]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './public/index.html'
        })
    ],
    mode: 'development',
    watch: true
};
