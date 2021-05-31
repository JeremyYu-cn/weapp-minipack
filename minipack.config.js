const path = require('path');
module.exports = {
    entry: path.resolve(__dirname, 'src'),
    outDir: path.resolve(__dirname, 'build'),
    isWatch: true,
    typeRoots: [
        path.resolve(__dirname, './typings'),
        path.resolve(__dirname, 'node_modules/@types/node')
    ],
}
