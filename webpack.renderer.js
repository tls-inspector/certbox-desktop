const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CspHtmlWebpackPlugin = require('csp-html-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');
const { execSync } = require('child_process');

let devtool = 'source-map';
let sourceType = 'development';
if (process.env.NODE_ENV === 'production') {
    devtool = undefined;
    sourceType = 'production.min';
}

const goroot = execSync('go env GOROOT').toString().trim();
const wasmExec = path.join(goroot, 'misc', 'wasm', 'wasm_exec.js')

function wasmSha() {
    const fileBuffer = fs.readFileSync(wasmExec);
    const hashSum = crypto.createHash('sha256');
    hashSum.update(fileBuffer);
    return "'sha256-" + hashSum.digest('base64') + "'";
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
        new CspHtmlWebpackPlugin({
            'script-src': ["'wasm-unsafe-eval'", wasmSha()]
        }),
        new CopyPlugin({
            patterns: [
                { from: 'img/*', to: 'assets' },
                { from: 'node_modules/react/umd/react.' + sourceType + '.js', to: 'assets/js/' },
                { from: 'node_modules/react-dom/umd/react-dom.' + sourceType + '.js', to: 'assets/js/' },
                { from: wasmExec, to: 'assets/js' },
                { from: 'certgen/certgen.wasm', to: 'assets' },
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
                type: 'asset/resource',
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
        hashFunction: 'xxhash64',
    },
};
