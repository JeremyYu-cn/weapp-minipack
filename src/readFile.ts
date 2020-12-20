import {
    readdirSync, existsSync, createReadStream, createWriteStream,
    statSync, mkdirSync, watch
} from 'fs';
import { resolve } from 'path';
import childProcess from 'child_process';
import { addEnv, changeMiniprogramConfig, } from './changeConfig';

const EXPLORE_REG = new RegExp(".*.(js|ts)$|.DS_Store");
const TS_REG = new RegExp(".*.ts$");

/**
 * 读取文件夹
 */
function readDir(filePath: string) {
    if (checkIsDir(filePath)) {
        return readdirSync(filePath);
    } else {
        return [];
    }
}

/**
 * 复制所有文件
 */
function copyFile(beginPath: string, endPath: string) {
    if(existsSync(beginPath) && !checkIsDir(beginPath)) {
        const readStream = createReadStream(beginPath);
        const writeStream = createWriteStream(endPath);
        readStream.pipe(writeStream);
    }
}

/**
 * 判断是否是文件夹
 */
function checkIsDir(filePath: string) {
    return statSync(filePath).isDirectory();
}

/**
 * 创建文件夹
 */
function createDir(filePath: string) {
    if (!existsSync(filePath)) {
        mkdirSync(filePath);
    }
}

/**
 * 判断两个文件大小是否相等
 */
function checkFileIsSame(pathA: string, pathB: string) {
    const fileASize = statSync(pathA).size;
    const fileBSize = statSync(pathB).size;
    return fileASize === fileBSize;
}

/**
 * 拷贝文件
 */
async function main(filePath: string, copyPath: string) {
    
    // 读取所有文件
    const fileArr = readDir(filePath);
    
    for (let i = 0; i < fileArr.length; i++) {
        const tmpPath = resolve(resolve(filePath, fileArr[i]));
        let endPath = resolve(copyPath, fileArr[i]);
        if (checkIsDir(tmpPath)) {
            createDir(endPath);
            main(tmpPath, endPath);
        } else {
            if (!EXPLORE_REG.test(endPath) || /\/lib\/.*|\lib\.*/g.test(endPath)) {
                if (existsSync(endPath) && checkFileIsSame(tmpPath, endPath)) {
                    continue;
                } else {
                    copyFile(tmpPath, endPath);
                }
            }
        }
    }
}

/**
 * 读取所有ts文件
 */
function readTsFile(obj: Record<string, string>, filePath: string, currentPath = '') {
    const fileArr = readDir(filePath);
    for (let i = 0; i < fileArr.length; i++) {
        const tmpPath = resolve(resolve(filePath, fileArr[i]));
        const keyPath = `${ currentPath }/${ fileArr[i] }`
        if (checkIsDir(tmpPath)) {
            readTsFile(obj, tmpPath, keyPath)
        } else {
            if (TS_REG.test(keyPath)) {
                const key = keyPath.replace(/.ts$/, '');
                obj[key] = tmpPath;
            }
        }
    }
}

/**
 * 监听文件改动
 */
let changeFileArr: { type: string, event: string, filename: string }[] = [];
let watchFileTimer: any = null;
function watchFile(option: miniPack.IWatchFileOption, during: number = 500) {
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

/**
 * 监听文件开始编译
 */
function actionCompile(
    fileArr: { type: string, event: string, filename: string }[],
    option: miniPack.IWatchFileOption
) {
    const {
        rootPath, copyPath, tsconfigPath, inpourEnv,
        miniprogramProjectConfig, miniprogramProjectPath,
        typingDirPath,
    } = option;

    // 对象去重
    fileArr = filterObject(fileArr);
    // 判断是否有文件新增或删除
    const isReadName = fileArr.filter(val => val.event === 'rename').length > 0;
    // ts之外的文件
    const assetsFile = fileArr.filter(val => val.type === 'asset');
    // ts文件
    const tsFile = fileArr.filter(val => val.type === 'ts');
    
    // 有文件新增或删除为重新编译
    if (isReadName) {
        const DeteleResult = childProcess.spawnSync('rm', ['-r', `${ copyPath }`]);
        console.log(`${ copyPath }/*`);
        console.log(DeteleResult.stderr.toString());
        const compileResult = childProcess.spawnSync('tsc', ['--project', tsconfigPath, '--outDir', copyPath]);
        if (compileResult.status === 0) {
            if (inpourEnv.isInpour) {
                addEnv(copyPath, inpourEnv.files, inpourEnv.data);
            }
            changeMiniprogramConfig(miniprogramProjectConfig, miniprogramProjectPath);
        }
        // 重新写入文件
        main(rootPath, copyPath);
    } else {
        // 写入ts文件
        const sourcePath = [];
        for (let compileFile of tsFile) {
            sourcePath.push(`${ resolve(rootPath, compileFile.filename) }`);
        }
        console.log(sourcePath);

        
        console.log('正在编译指定文件');
        console.time('compile');

        let args = sourcePath.concat([
            '--typeRoots', typingDirPath.join(','), '--lib', 
            'es6,ES2017.Object,ES2015.Promise','--outDir', copyPath
        ])
        if (typingDirPath.length) args = args.concat(['--typeRoots', typingDirPath.join(',')]);

        const compileResult = childProcess.spawnSync('tsc', args);
        console.log(compileResult.stdout.toString());
        
        if (inpourEnv.isInpour) {
            addEnv(copyPath, inpourEnv.files, inpourEnv.data);
        }
        console.log('编译完成');
        console.timeEnd('compile');

        // 写入修改的文件
        for(let assetFile of assetsFile) {
            copyFile(resolve(rootPath, assetFile.filename), resolve(copyPath, assetFile.filename))
        }
    }
}

// 对象数组去重
function filterObject(arr: { type: string, event: string, filename: string }[]) {
    const obj: Record<string, any> = {};
    const result: { type: string, event: string, filename: string }[] = [];
    arr.forEach(val => {
        const key = `${ val.type }_${ val.event }_${ val.filename }`
        if (!obj[ key ]) {
            obj[ key ] = 1;
            result.push(val);
        }
    })
    return result;
}

export {
    EXPLORE_REG,
    readTsFile,
    main,
    watchFile,
}

