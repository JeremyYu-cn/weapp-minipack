/**
 * 改变小程序配置
 */
export declare function changeMiniprogramConfig(config?: {}, configPath?: string): void;
/**
 * 注入环境变量
 * @param { String } path
 * @param { Array String } configFile
 * @param { String } env
 */
export declare function addEnv(rootPath: string, configFile: string[], env: string): void;
