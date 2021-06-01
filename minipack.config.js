const path = require('path');
module.exports = {
    watchEntry: path.resolve(__dirname, 'experience'),
    tsConfigPath: path.resolve(__dirname, 'tsconfig.json'),
    outDir: path.resolve(__dirname, 'build'),
    isWatch: true,
    typeRoots: [
        path.resolve(__dirname, './typings'),
        path.resolve(__dirname, 'node_modules/@types/node')
    ],
}
