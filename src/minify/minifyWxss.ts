import { minify } from "html-minifier";

/**
 * 压缩HTML CSS文件
 * @param filePath 
 * @param endPath 
 * @returns 
 */
 export function minifierStyle({ data, }: miniPack.IPluginOption): string {
  return minify(data, {
    minifyCSS: true,
    removeComments: true,
    collapseWhitespace: true,
    keepClosingSlash: true,
    trimCustomFragments: true,
    caseSensitive: true,
  })
}