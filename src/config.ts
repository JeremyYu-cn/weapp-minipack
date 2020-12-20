/**
 * default config
 */
import { resolve } from 'path';
const config: miniPack.IConfigOption = {
    env: process.env.NODE_ENV || 'none',
    entry: '',
    outDir: resolve(__dirname, '../dist'),
    isTs: true,
    tsConfigPath: resolve(__dirname, '../tsconfig.json'),
    miniprogramProjectPath: resolve(__dirname, '../project.config.json'),
    miniprogramProjectConfig: {},
    isWatch: false,
    inpouringEnv: {
        isInpour: false,
        files: [],
        data: '',
    },
    typeRoots: [],
}

export default config;
