const path = require('path');

module.exports = {
    mode: 'production',
    target: 'node',
    entry: 'index.ts',
    output: {
        filename: 'index.js',
        path: path.resolve(__dirname, 'dist'),
    },
    rules: [
        {
            test: '*.ts',
            loader: 'ts-loader',
        },
    ]
}
