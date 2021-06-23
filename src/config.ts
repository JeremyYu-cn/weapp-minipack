/**
 * default config
 */
import { resolve } from 'path';
import { miniPackConfigOption } from './typings/config';

const config: miniPackConfigOption = {
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
    plugins: [],
}

export default config;
