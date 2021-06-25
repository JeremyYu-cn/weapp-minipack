import type esbuild from 'esbuild';

type PluginFunction = {
    test: RegExp,
    action: (data: IPluginOption) => string
}

export interface InpouringEnvOtion {
    /**
     * control inpour env data or not
     */
    isInpour: boolean
    /**
     * inpour files
     */
    files: string[]

    /**
     * inpour data
     */
    data: string
}

export interface miniPackConfigOption {
  /**
   * current bundler env
   */
  env: string

  /**
   * your program's watch file entry path
   */
   watchEntry: string

  /**
   * output file root path
   */
  outDir: string

  /**
   * typescript's config file path
   * if param "isTs" is false, you can ignore it
   */
  tsConfigPath: string

  /**
   * set use program language
   */
  isTs: boolean

  /**
   * wechat miniprogram project.config.json path
   */
  miniprogramProjectPath: string

  /**
   * wechat miniProgram project.config.json param
   * you can change project config after the first bundle finished
   */
  miniprogramProjectConfig: Record<string, any>

  /**
   * inpouring env data option
   */
  inpouringEnv: InpouringEnvOtion

  /**
   * whether watch file change to compile or not
   */
  isWatch: boolean

  /**
   * tsconfig typeRoots 
   */
  typeRoots: string[]
  
  /**
   * plugins
   */
  plugins?: PluginFunction[]

  /**
   * compile options
   */
   esBuildOptions?: esbuild.BuildOptions
}

import { minifierStyle } from './minify/minifyWxss';
import { minifyerWxml } from './minify/minifyWxml';
import commander from 'commander';
export declare class Entry {
    private DEFAULT_MINIPACK_CONFIG_PATH;
    private program;
    private config;
    constructor(data: {
        configPath?: string;
        command?: commander.Command;
    });
    /**
     * init project
     */
    init(): this;
    /**
     * setting bundler config
     */
    setConfig(): void;
    /**
     * start build
     */
    start(): Promise<void>;
    /**
     * copy other asset files
     */
    copyFile(): Promise<unknown>;
    /**
     * watchFile
     */
    watchFile(): void;
}
export declare const minifyStyle: typeof minifierStyle;
export declare const minifyWxml: typeof minifyerWxml;

