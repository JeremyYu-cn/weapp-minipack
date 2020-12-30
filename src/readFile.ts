import {
    readdirSync, existsSync, createReadStream, createWriteStream,
    statSync, mkdirSync, watch,
} from 'fs';
import readLine from 'readline';
import { resolve } from 'path';
import childProcess from 'child_process';
import { addEnv, changeMiniprogramConfig, } from './changeConfig';

const EXPLORE_REG = new RegExp(".*.(js|ts)$|.DS_Store");
const TS_REG = /.*\.ts$/;
const IMPORT_REG = /import.*from.*/;

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
async function actionCompile(
    fileArr: { type: string, event: string, filename: string }[],
    option: miniPack.IWatchFileOption
) {
    const {
        rootPath, tsconfigPath, inpourEnv,
        miniprogramProjectConfig, miniprogramProjectPath,
        typingDirPath,
    } = option;
    let { copyPath } = option;

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
        if (tsFile.length) {
            const sourcePath = [];
            let outDirArr: string[] = [];
            for (let compileFile of tsFile) {
                if (TS_REG.test(compileFile.filename)) {
                    const sourchFile = resolve(rootPath, compileFile.filename);
                    const isImport = await checkIsImport(sourchFile)
                    let compilePath: string | string[] = resolve(copyPath, compileFile.filename).replace(/\\/g, '\/').split('\/');
                    compilePath.splice(compilePath.length - 1, 1);
                    compilePath = compilePath.join('/');

                    console.log('sourchFile', sourchFile);
                    console.log('compilePath', compilePath);
                    
                    sourcePath.push(`${ sourchFile }`);
                    outDirArr = outDirArr.concat([`--outDir` , isImport ? copyPath : compilePath, sourchFile]);
                }
            }
            if (sourcePath.length) {
                console.log(sourcePath);
                
                console.log('正在编译指定文件');
                console.time('compile');
                
                let args = sourcePath.concat([
                    '--lib', 'es6,ES2017.Object,ES2015.Promise',
                ], outDirArr);
                if (typingDirPath.length) args = args.concat(['--types', typingDirPath.join(',')]);
                
                const compileResult = childProcess.spawnSync('tsc', args);
                console.log(compileResult.stdout.toString());
                
                if (inpourEnv.isInpour) {
                    addEnv(copyPath, inpourEnv.files, inpourEnv.data);
                }
                console.log('编译完成');
                console.timeEnd('compile');
            }
        }

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

/**
 *  查看文件是否有import
 * @param filePath 文件路径
 */
function checkIsImport(filePath: string): Promise<boolean>{
    return new Promise(finished => {
        if (checkIsDir(filePath)) finished(false);
        const readStream = createReadStream(filePath);
        const rl = readLine.createInterface(readStream);
        let isImport = false;
        rl.on('line', (lineData) => {
            if (IMPORT_REG.test(lineData)) {
                isImport = true;
                rl.close();
            }
        })
        rl.on('close', () => {
            finished(isImport);
        })
    })
    
}

export {
    EXPLORE_REG,
    readTsFile,
    main,
    watchFile,
    checkIsImport,
}

