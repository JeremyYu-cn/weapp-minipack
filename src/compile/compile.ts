import esbuild, { build } from 'esbuild';
import { resolve } from 'path';
import { addEnv, changeMiniprogramConfig } from '../changeConfig';
import { handleAssetsFile } from '../controlFile/handleAssetsFile';
import { readTsFile, startCompile } from '../controlFile/readFile';
import { filterObject } from '../utils/utils';

/**
 * 压缩代码主方法
 * @param options esbuild options
 * @returns 
 */
export async function translateCode(options: esbuild.BuildOptions) {
  try {
    const result = await build(options);
    return result;
  } catch(err) {
    console.log('build err', err);
    return false;
  }
}

/**
 * 编译TS文件
 */
export async function actionCompileTsFile(
  tsFile: miniPack.ITsFileData[],
  rootPath: string,
  copyPath: string,
  inpourEnv: miniPack.InpouringEnvOtion,
  esBuildOptions: esbuild.BuildOptions,
) {
  console.log('正在编译指定文件');
  console.time('compile');
  for (let compileFile of tsFile) {
      const sourchFile = resolve(rootPath, compileFile.filename);
      let compilePath: string | string[] = resolve(copyPath, compileFile.filename).replace(/\\/g, '\/').split('\/');
      compilePath.splice(compilePath.length - 1, 1);
      compilePath = compilePath.join('/');
      
      const result = await translateCode({
          format: 'cjs',
          entryPoints: [ sourchFile ],
          minify: true,
          outdir: compilePath,
          ...esBuildOptions,
      })
      console.log(result);
      if (inpourEnv.isInpour) {
          addEnv(copyPath, inpourEnv.files, inpourEnv.data);
      }
  }
  console.log('编译完成');
  console.timeEnd('compile');
}

/**
 * 监听文件开始编译
 */
export async function actionCompile(
  fileArr: { type: string, event: string, filename: string }[],
  option: miniPack.IWatchFileOption
) {
  const {
      rootPath, inpourEnv,
      miniprogramProjectConfig, miniprogramProjectPath,
      plugins = [], esBuildOptions,
  } = option;
  let { copyPath, } = option;

  // 对象去重
  fileArr = filterObject(fileArr);
  // 判断是否有文件新增或删除
  const isReadName = fileArr.filter(val => val.event === 'rename').length > 0;
  // ts之外的文件
  const assetsFile = fileArr.filter(val => val.type === 'asset');
  // ts文件
  const tsFile = fileArr.filter(val => val.type === 'ts');
  
  // 有文件新增或删除为重新编译
  if (isReadName) {
      const fileList = readTsFile(rootPath)
      const compileResult = await translateCode({
        format: 'cjs',
        entryPoints: fileList,
        minify: true,
        outdir: copyPath,
        ...esBuildOptions,
      })
      if (compileResult) {
          if (inpourEnv.isInpour) {
              addEnv(copyPath, inpourEnv.files, inpourEnv.data);
          }
          changeMiniprogramConfig(miniprogramProjectConfig, miniprogramProjectPath);
      }
      // 重新写入文件
      startCompile(rootPath, copyPath);
  } else {
      // 写入ts文件
      if (tsFile.length) {
          await actionCompileTsFile(tsFile, rootPath, copyPath, inpourEnv, esBuildOptions);
      }

      // 写入修改的文件
      for(let assetFile of assetsFile) {
          handleAssetsFile(
            resolve(rootPath, assetFile.filename),
            resolve(copyPath, assetFile.filename),
            plugins,
          )
      }
  }
}
