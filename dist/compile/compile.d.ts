import esbuild from 'esbuild';
/**
 * 压缩代码主方法
 * @param options esbuild options
 * @returns
 */
export declare function translateCode(options: esbuild.BuildOptions): Promise<false | esbuild.BuildResult>;
/**
 * 编译TS文件
 */
export declare function actionCompileTsFile(tsFile: miniPack.ITsFileData[], rootPath: string, copyPath: string, inpourEnv: miniPack.InpouringEnvOtion, esBuildOptions: esbuild.BuildOptions): Promise<void>;
/**
 * 监听文件开始编译
 */
export declare function actionCompile(fileArr: {
    type: string;
    event: string;
    filename: string;
}[], option: miniPack.IWatchFileOption): Promise<void>;
