const path = require('path');
module.exports = {
    entry: 'src',
    isWatch: true,
    typeRoots: [
        path.resolve(__dirname, './typings'),
        path.resolve(__dirname, 'node_modules/@types/node')
    ],
}
