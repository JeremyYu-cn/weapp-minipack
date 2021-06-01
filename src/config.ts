/**
 * default config
 */
import { resolve } from 'path';
const config: miniPack.IConfigOption = {
    env: process.env.NODE_ENV || 'none',
    watchEntry: '',
    outDir: resolve(process.cwd(), 'dist'),
    isTs: true,
    tsConfigPath: '',
    miniprogramProjectPath: resolve(process.cwd(), '../project.config.json'),
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
