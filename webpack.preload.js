const path = require('path');

let devtool = 'source-map';
if (process.env.NODE_ENV === 'production') {
    devtool = undefined;
}

module.exports = {
    mode: 'development',
    devtool: devtool,
    entry: {
        main: ['./src/main/preload.js']
    },
    module: {
        rules: [
            {
                test: /\.node$/,
                use: 'node-loader',
            },
        ],
    },
    resolve: {
        extensions: ['.js']
    },
    target: 'electron-preload',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'preload.js',
    },
};
