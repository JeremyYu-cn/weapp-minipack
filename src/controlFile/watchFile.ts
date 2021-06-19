import { watch } from "fs";
import { actionCompile } from "../compile/compile";
import { EXPLORE_REG } from "../globalConfig";

/**
 * 监听文件改动
 */
 let changeFileArr: { type: string, event: string, filename: string }[] = [];
 let watchFileTimer: any = null;
export function watchFile(option: miniPack.IWatchFileOption, during: number = 500) {
     console.log('开始监听文件');
     const { rootPath, } = option;
     watch(rootPath, { recursive: true, }, (event, filename) => {
         clearTimeout(watchFileTimer);
         changeFileArr.push({
             type: EXPLORE_REG.test(filename) ? 'ts' : 'asset',
             event,
             filename,
         })
         
         watchFileTimer = setTimeout(() => {
             actionCompile(changeFileArr, option);
             changeFileArr = [];
         }, during);
     })
 }