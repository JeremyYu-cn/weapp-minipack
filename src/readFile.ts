import {
    readdirSync, existsSync, createReadStream, createWriteStream,
    statSync, mkdirSync, watch,
} from 'fs';
import readLine from 'readline';
import { resolve } from 'path';
import childProcess from 'child_process';
import { addEnv, changeMiniprogramConfig, } from './changeConfig';
import { filterObject } from './utils/utils';
import { translateCode } from './compile/compile';

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
 * 获取文件夹内所有文件
 */
function getDirAllFile(filePath: string) {
    let fileArr: string[] = [];
    
    if (checkIsDir(filePath)) {
        const fileList = readdirSync(filePath);
        
        fileList.forEach(val => {
            const tmpPath = resolve(filePath,val)
            if (checkIsDir(tmpPath)) {
                fileArr = fileArr.concat(getDirAllFile(tmpPath));
            } else {
                fileArr.push(tmpPath);
            }
        })
        return fileArr
    }
    return [];
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
    for (let x of fileArr) {
        const tmpPath = resolve(resolve(filePath, x));
        let endPath = resolve(copyPath, x);
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
function readTsFile(filePath: string, currentPath = '') {
    const fileArr = readDir(filePath);
    let resultArr: string[] = [];
    for (let x of fileArr) {
        const tmpPath = resolve(filePath, x);
        const keyPath = `${ currentPath }/${ x }`;
        if (checkIsDir(tmpPath)) {
            resultArr = resultArr.concat(readTsFile(tmpPath, keyPath));
        } else {
            if (TS_REG.test(keyPath)) {
                resultArr.push(tmpPath);
            }
        }
    }
    return resultArr;
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
        const compileResult = childProcess.spawnSync('tsc', ['--project', tsconfigPath, '--outDir', copyPath], { shell: true });
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
            await actionCompileTsFile(tsFile, rootPath, copyPath, typingDirPath, inpourEnv);
        }

        // 写入修改的文件
        for(let assetFile of assetsFile) {
            copyFile(resolve(rootPath, assetFile.filename), resolve(copyPath, assetFile.filename))
        }
    }
}

/**
 * 编译TS文件
 */
async function actionCompileTsFile(
    tsFile: miniPack.ITsFileData[],
    rootPath: string,
    copyPath: string,
    typingDirPath: string[],
    inpourEnv: miniPack.InpouringEnvOtion,
) {
    console.log('正在编译指定文件');
    console.time('compile');
    for (let compileFile of tsFile) {
        const sourchFile = resolve(rootPath, compileFile.filename);
        let compilePath: string | string[] = resolve(copyPath, compileFile.filename).replace(/\\/g, '\/').split('\/');
        compilePath.splice(compilePath.length - 1, 1);
        compilePath = compilePath.join('/');
        
        const result = await translateCode({
            format: 'cjs',
            entryPoints: [ sourchFile ],
            minify: true,
            outdir: compilePath,
        })
        console.log(result);
        if (inpourEnv.isInpour) {
            addEnv(copyPath, inpourEnv.files, inpourEnv.data);
        }
    }
    console.log('编译完成');
    console.timeEnd('compile');
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

export default {
    EXPLORE_REG,
    readTsFile,
    main,
    watchFile,
    checkIsImport,
    getDirAllFile,
}

