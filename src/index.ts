import childProcess from 'child_process';
import { resolve } from 'path';
import { statSync, existsSync } from 'fs';
import commander from 'commander';
import DEFAULT_CONFIG from './config';

const handleFile = require('./readFile');
const projectConfig = require('./changeConfig');

class Entry {
    private DEFAULT_MINIPACK_CONFIG_PATH: string;
    private program: null | commander.Command;
    private config: miniPack.IConfigOption
    constructor() {
        this.DEFAULT_MINIPACK_CONFIG_PATH = resolve(__dirname, '../../minipack.config.js')
        this.program = null;
        this.config = DEFAULT_CONFIG;
    }

    /**
     * init project
     */
    init() {
        this.program = new commander.Command()
        .version('0.0.1')
        .option('-c, --config <type>', 'config file path', this.DEFAULT_MINIPACK_CONFIG_PATH) // set config file path
        .option('-h, --help', 'helping how to use')
        .parse(process.argv);
        
        this.setConig();

        return this;
    }

    /**
     * setting bundler config
     */
    setConig() {
         
        if (this.program) {
            // get config file
            console.log(this.program.config);
            
            if (existsSync(this.program.config) && statSync(this.program.config).isFile()) {
                try {
                    let data = require(this.program.config);
                    
                    Object.assign(this.config, data);
                    
                } catch(err) {
                    console.log(err);
                    return;
                }
            }
        }
    }

    /**
     * start build
     */
    async start() {
        const {
            tsConfigPath, outDir, inpouringEnv
        } = this.config;
        
        console.log('compile start');
        const result = childProcess.spawnSync(`tsc`,[`--project`, tsConfigPath, '--outDir', outDir,], { shell: true, });
        if (result.status === 0) {
            console.log('compile finished');
            
            if (inpouringEnv.isInpour) {
                console.log('start inpour data');
                projectConfig.addEnv(outDir, inpouringEnv.files, inpouringEnv.data);
                console.log('inpour finished');
            }

            await this.copyFile();
            this.watchFile();
        } else {
            console.log(result.stdout.toString('utf-8'))
            return;
        }
    }

    /**
     * copy other asset files
     */
    copyFile() {
        return new Promise(truly => {
            const { entry, outDir, miniprogramProjectConfig, miniprogramProjectPath } = this.config;
            console.log('start copy asset files');
            setTimeout(async () => {
                await handleFile.main(entry, outDir);
                projectConfig.changeMiniprogramConfig(miniprogramProjectConfig, miniprogramProjectPath);
                console.log('copy assets success');
                truly(true);
            },1000)
        })
        
    }

    /**
     * watchFile
     */
    watchFile() {
        const {
            isWatch, entry, outDir, tsConfigPath,
            miniprogramProjectConfig, miniprogramProjectPath,
            inpouringEnv, typeRoots,
        } = this.config;
        if (isWatch) {
            const watchOption: miniPack.IWatchFileOption = {
                rootPath: entry,
                copyPath: outDir,
                tsconfigPath: tsConfigPath,
                inpourEnv: inpouringEnv,
                miniprogramProjectPath,
                miniprogramProjectConfig,
                typingDirPath: typeRoots,
            }
            handleFile.watchFile(watchOption);
        }
    }
}

export default Entry
