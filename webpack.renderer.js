const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');

let devtool = 'source-map';
let sourceType = 'development';
if (process.env.NODE_ENV === 'production') {
    devtool = undefined;
    sourceType = 'production.min';
}

module.exports = {
    mode: 'development',
    devtool: devtool,
    entry: './src/renderer/index.tsx',
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.html']
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: 'html/index.' + sourceType + '.html'
        }),
        new CopyPlugin({
            patterns: [
                { from: 'img/*', to: 'assets' },
                { from: 'node_modules/react/umd/react.' + sourceType + '.js', to: 'assets/js/' },
                { from: 'node_modules/react-dom/umd/react-dom.' + sourceType + '.js', to: 'assets/js/' },
            ]
        }),
        new ESLintPlugin({
            extensions: ['.ts', '.tsx']
        }),
    ],
    target: 'electron-renderer',
    module: {
        rules: [
            {
                test: /\.ts(x?)$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'ts-loader'
                    }
                ]
            },
            {
                test: /\.(woff|woff2)$/,
                use: {
                    loader: 'url-loader',
                },
            },
            {
                enforce: 'pre',
                test: /\.js$/,
                loader: 'source-map-loader'
            },
            {
                test: /\.s[ac]ss$/i,
                use: [
                    'style-loader',
                    'css-loader',
                    'sass-loader',
                ],
            },
        ]
    },
    externals: {
        'react': 'React',
        'react-dom': 'ReactDOM',
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'app.js',
    },
};
