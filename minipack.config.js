const path = require('path');
module.exports = {
    entry: 'src',
    outDir: path.resolve(__dirname, 'build'),
    isWatch: true,
    typeRoots: [
        path.resolve(__dirname, './typings'),
        path.resolve(__dirname, 'node_modules/@types/node')
    ],
}
