const path = require('path');
const { minify } = require("html-minifier");

/**
 * 压缩HTML CSS文件
 */
function minifierStyle({ data,}) {
  return minify(data, {
    minifyCSS: true,
    removeComments: true,
    collapseWhitespace: true,
    keepClosingSlash: true,
    trimCustomFragments: true,
    caseSensitive: true,
  })
}

function minifyWxml({ data, }) {
    return data.replace(/\n|\s{2,}/g, ' ').replace(/\/\/.*|<!--.*-->/g, '')
  }

/**
 * @type import('./dist/index').miniPackConfigOption
 */
module.exports = {
    watchEntry: path.resolve(__dirname, 'test','compileCode'),
    tsConfigPath: path.resolve(__dirname, 'tsconfig.json'),
    outDir: path.resolve(__dirname, 'build'),
    isWatch: true,
    typeRoots: [
        path.resolve(__dirname, './typings'),
        path.resolve(__dirname, 'node_modules/@types/node')
    ],
    esBuildOptions: {
      sourcemap: true,
    },
    plugins: [
        {
            test: /.*\.(wxml)$/,
            action: minifyWxml,
        },
        {
            test: /.*\.(wxss)$/,
            action: minifierStyle,
        }
    ]
}
