// import childProcess from 'child_process';
import { resolve } from 'path';
import { statSync, existsSync, } from 'fs';
import type commander from 'commander';
import DEFAULT_CONFIG from './config';

import handleFile from './readFile';
import { addEnv, changeMiniprogramConfig, } from './changeConfig';
import { translateCode } from './compile/compile';
export default class Entry {
  private DEFAULT_MINIPACK_CONFIG_PATH: string;
  private program: null | commander.Command;
  private config: miniPack.IConfigOption
  constructor(data: {configPath?: string, command?: commander.Command}) {
    const { configPath, command } = data;
    this.program = command || null;
    this.DEFAULT_MINIPACK_CONFIG_PATH = configPath || resolve(__dirname, '../minipack.config.js')
    this.config = DEFAULT_CONFIG;
      
  }

  /**
   * init project
   */
  init() {
    this.setConfig();
    return this;
  }

  /**
   * setting bundler config
   */
  setConfig() {
    let file = this.DEFAULT_MINIPACK_CONFIG_PATH;
    if (this.program) {
      // get config file
      if (!this.program.config) {
        this.program.config = this.DEFAULT_MINIPACK_CONFIG_PATH;
      } else {
        const isFullPath = /^\/.*/.test(this.program.config);
        file = isFullPath ? this.program.config : resolve(process.cwd(), this.program.config);
      }
    }
    
    if (existsSync(file) && statSync(file).isFile()) {
        try {
          let data = require(file);
          Object.assign(this.config, data);
          console.log(this.config);
          if (!this.config.tsConfigPath) throw new Error('tsConfigPath must defined');
          if (!existsSync(file) || !statSync(file).isFile()) throw new Error('tsConfigPath path is not found');
          
        } catch(err) {
          throw new Error(err.toString())
        }
    } else {
      throw new Error(`config file ${ file } is not defined`)
    }
  }

  /**
   * start build
   */
  async start() {
    const {
      watchEntry, outDir, inpouringEnv
    } = this.config;
    
    console.log('compile start');
    const fileList = handleFile.readTsFile(watchEntry)
    
    const compileResult = await translateCode({
      format: 'cjs',
      entryPoints: fileList,
      minify: true,
      outdir: outDir,
    })
    // const result = childProcess.spawnSync(`tsc`,[`--project`, tsConfigPath, '--outDir', outDir,], { shell: true, });
    if (compileResult) {
      console.log('compile finished');
      if (inpouringEnv.isInpour) {
        console.log('start inpour data');
        addEnv(outDir, inpouringEnv.files, inpouringEnv.data);
        console.log('inpour finished');
      }

      await this.copyFile();
      this.watchFile();
    } else {
      return;
    }
  }

  /**
   * copy other asset files
   */
  copyFile() {
    return new Promise(truly => {
      const { watchEntry, outDir, miniprogramProjectConfig, miniprogramProjectPath } = this.config;
      console.log('start copy asset files');
      setTimeout(async () => {
        await handleFile.main(watchEntry, outDir);
        changeMiniprogramConfig(miniprogramProjectConfig, miniprogramProjectPath);
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
      isWatch, watchEntry, outDir, tsConfigPath,
      miniprogramProjectConfig, miniprogramProjectPath,
      inpouringEnv, typeRoots,
    } = this.config;
    
    if (isWatch) {
      const watchOption: miniPack.IWatchFileOption = {
        rootPath: watchEntry,
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




