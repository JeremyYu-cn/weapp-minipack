/**
 * 判断是否是文件夹
 */
export declare function checkIsDir(filePath: string): boolean;
/**
 * 判断两个文件大小是否相等
 */
export declare function checkFileIsSame(pathA: string, pathB: string): boolean;
/**
 *  查看文件是否有import
 * @param filePath 文件路径
 */
export declare function checkIsImport(filePath: string): Promise<boolean>;
