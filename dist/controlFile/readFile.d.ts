/**
 * 获取文件夹内所有文件
 */
export declare function getDirAllFile(filePath: string): string[];
/**
 * 用流的方式复制文件
 */
export declare function copyFile(beginPath: string, endPath: string): void;
/**
 * 开始编译
 */
export declare function startCompile(filePath: string, copyPath: string, plugins?: PluginFunction[]): Promise<void>;
/**
 * 读取所有ts文件
 */
export declare function readTsFile(filePath: string, currentPath?: string): string[];
