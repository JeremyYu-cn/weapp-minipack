import esbuild, { build } from 'esbuild';
import { readFileSync, writeFileSync } from 'fs';
import { minify } from 'html-minifier';

/**
 * 压缩代码主方法
 * @param options esbuild options
 * @returns 
 */
export async function translateCode(options: esbuild.BuildOptions) {
  try {
    const result = await build(options);
    console.log('build result', result);
    return result;
  } catch(err) {
    console.log('build err', err);
    return false;
  }
  
}

/**
 * 压缩HTML CSS文件
 * @param filePath 
 * @param endPath 
 * @returns 
 */
export function minifierHtml(filePath: string, endPath: string) {
  const result = minify(readFileSync(filePath, { encoding: 'utf-8' }), {
    minifyCSS: true,
    removeComments: true,
    removeEmptyAttributes: true,
    removeEmptyElements: true,
    removeOptionalTags: true,
    removeScriptTypeAttributes: true,
    collapseWhitespace: true,
  })
  console.log(result);
  
  writeFileSync(endPath, result, { encoding: 'utf-8' });
  return true;
}

