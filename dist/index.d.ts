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
