'use strict';

var path = require('path');
var fs = require('fs');
var readLine = require('readline');
var childProcess = require('child_process');
var esbuild = require('esbuild');
var htmlMinifier = require('html-minifier');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var readLine__default = /*#__PURE__*/_interopDefaultLegacy(readLine);
var childProcess__default = /*#__PURE__*/_interopDefaultLegacy(childProcess);

/**
 * default config
 */
const config = {
    env: process.env.NODE_ENV || 'none',
    watchEntry: '',
    outDir: path.resolve(process.cwd(), 'dist'),
    isTs: true,
    tsConfigPath: '',
    miniprogramProjectPath: path.resolve(process.cwd(), '../project.config.json'),
    miniprogramProjectConfig: {},
    isWatch: false,
    inpouringEnv: {
        isInpour: false,
        files: [],
        data: '',
    },
    typeRoots: [],
};

const PROJECT_CONFIG_PATH = path.resolve(__dirname, '../project.config.json');
/**
 * 改变小程序配置
 */
function changeMiniprogramConfig(config = {}, configPath = PROJECT_CONFIG_PATH) {
    if (fs.existsSync(configPath)) {
        let data = fs.readFileSync(configPath, { encoding: 'utf-8' });
        try {
            data = JSON.parse(data);
            Object.assign(data, config);
            data = JSON.stringify(data).replace(/{/g, '{\r\n')
                .replace(/}/g, '}\r\n').replace(/,/g, ',\r\n')
                .replace(/\[/g, '[\r\n').replace(/\]/g, ']\r\n');
            fs.writeFileSync(configPath, data);
        }
        catch (err) {
            console.error(err);
        }
    }
}
/**
 * 注入环境变量
 * @param { String } path
 * @param { Array String } configFile
 * @param { String } env
 */
function addEnv(rootPath, configFile, env) {
    for (let x of configFile) {
        const file = path.resolve(rootPath, x);
        if (fs.existsSync(file) && fs.statSync(file).isFile()) {
            const data = fs.readFileSync(file, { encoding: 'utf-8' });
            console.log(env);
            fs.writeFileSync(file, [env, '\r\n', data.replace(new RegExp(env, 'g'), '')].join(''));
        }
    }
}

// 对象数组去重
function filterObject(arr) {
    const obj = {};
    const result = [];
    arr.forEach(val => {
        const key = `${val.type}_${val.event}_${val.filename}`;
        if (!obj[key]) {
            obj[key] = 1;
            result.push(val);
        }
    });
    return result;
}

/**
 * 压缩代码主方法
 * @param options esbuild options
 * @returns
 */
async function translateCode(options) {
    try {
        const result = await esbuild.build(options);
        console.log('build result', result);
        return result;
    }
    catch (err) {
        console.log('build err', err);
        return false;
    }
}
/**
 * 压缩HTML CSS文件
 * @param filePath
 * @param endPath
 * @returns
 */
function minifierHtml(filePath, endPath) {
    const result = htmlMinifier.minify(fs.readFileSync(filePath, { encoding: 'utf-8' }), {
        minifyCSS: true,
        removeComments: true,
        removeEmptyAttributes: true,
        removeEmptyElements: true,
        removeOptionalTags: true,
        removeScriptTypeAttributes: true,
        collapseWhitespace: true,
    });
    console.log(result);
    fs.writeFileSync(endPath, result, { encoding: 'utf-8' });
    return true;
}

const EXPLORE_REG = new RegExp(".*.(js|ts)$|.DS_Store");
const TS_REG = /.*\.ts$/;
const IMPORT_REG = /import.*from.*/;
const HTML_CSS_REG = /.*\.(wxml|wxss)$/;
/**
 * 读取文件夹
 */
function readDir(filePath) {
    if (checkIsDir(filePath)) {
        return fs.readdirSync(filePath);
    }
    else {
        return [];
    }
}
/**
 * 获取文件夹内所有文件
 */
function getDirAllFile(filePath) {
    let fileArr = [];
    if (checkIsDir(filePath)) {
        const fileList = fs.readdirSync(filePath);
        fileList.forEach(val => {
            const tmpPath = path.resolve(filePath, val);
            if (checkIsDir(tmpPath)) {
                fileArr = fileArr.concat(getDirAllFile(tmpPath));
            }
            else {
                fileArr.push(tmpPath);
            }
        });
        return fileArr;
    }
    return [];
}
/**
 * 复制所有文件
 */
function copyFile(beginPath, endPath) {
    if (fs.existsSync(beginPath) && !checkIsDir(beginPath)) {
        const readStream = fs.createReadStream(beginPath);
        const writeStream = fs.createWriteStream(endPath);
        readStream.pipe(writeStream);
    }
}
/**
 * 判断是否是文件夹
 */
function checkIsDir(filePath) {
    return fs.statSync(filePath).isDirectory();
}
/**
 * 创建文件夹
 */
function createDir(filePath) {
    if (!fs.existsSync(filePath)) {
        fs.mkdirSync(filePath);
    }
}
/**
 * 判断两个文件大小是否相等
 */
function checkFileIsSame(pathA, pathB) {
    const fileASize = fs.statSync(pathA).size;
    const fileBSize = fs.statSync(pathB).size;
    return fileASize === fileBSize;
}
/**
 * 拷贝文件
 */
async function main(filePath, copyPath) {
    // 读取所有文件
    const fileArr = readDir(filePath);
    for (let x of fileArr) {
        const tmpPath = path.resolve(path.resolve(filePath, x));
        let endPath = path.resolve(copyPath, x);
        if (checkIsDir(tmpPath)) {
            createDir(endPath);
            main(tmpPath, endPath);
        }
        else if (!EXPLORE_REG.test(endPath) || /\/lib\/.*|\lib\.*/g.test(endPath)) {
            if (fs.existsSync(endPath) && checkFileIsSame(tmpPath, endPath)) {
                continue;
            }
            else {
                if (HTML_CSS_REG.test(tmpPath)) {
                    console.log('tmpPath', tmpPath);
                    minifierHtml(tmpPath, endPath);
                }
                else {
                    copyFile(tmpPath, endPath);
                }
            }
        }
    }
}
/**
 * 读取所有ts文件
 */
function readTsFile(filePath, currentPath = '') {
    const fileArr = readDir(filePath);
    let resultArr = [];
    for (let x of fileArr) {
        const tmpPath = path.resolve(filePath, x);
        const keyPath = `${currentPath}/${x}`;
        if (checkIsDir(tmpPath)) {
            resultArr = resultArr.concat(readTsFile(tmpPath, keyPath));
        }
        else {
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
let changeFileArr = [];
let watchFileTimer = null;
function watchFile(option, during = 500) {
    console.log('开始监听文件');
    const { rootPath, } = option;
    fs.watch(rootPath, { recursive: true, }, (event, filename) => {
        clearTimeout(watchFileTimer);
        changeFileArr.push({
            type: EXPLORE_REG.test(filename) ? 'ts' : 'asset',
            event,
            filename,
        });
        watchFileTimer = setTimeout(() => {
            actionCompile(changeFileArr, option);
            changeFileArr = [];
        }, during);
    });
}
/**
 * 监听文件开始编译
 */
async function actionCompile(fileArr, option) {
    const { rootPath, tsconfigPath, inpourEnv, miniprogramProjectConfig, miniprogramProjectPath, typingDirPath, } = option;
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
        const compileResult = childProcess__default['default'].spawnSync('tsc', ['--project', tsconfigPath, '--outDir', copyPath], { shell: true });
        if (compileResult.status === 0) {
            if (inpourEnv.isInpour) {
                addEnv(copyPath, inpourEnv.files, inpourEnv.data);
            }
            changeMiniprogramConfig(miniprogramProjectConfig, miniprogramProjectPath);
        }
        // 重新写入文件
        main(rootPath, copyPath);
    }
    else {
        // 写入ts文件
        if (tsFile.length) {
            await actionCompileTsFile(tsFile, rootPath, copyPath, typingDirPath, inpourEnv);
        }
        // 写入修改的文件
        for (let assetFile of assetsFile) {
            copyFile(path.resolve(rootPath, assetFile.filename), path.resolve(copyPath, assetFile.filename));
        }
    }
}
/**
 * 编译TS文件
 */
async function actionCompileTsFile(tsFile, rootPath, copyPath, typingDirPath, inpourEnv) {
    console.log('正在编译指定文件');
    console.time('compile');
    for (let compileFile of tsFile) {
        const sourchFile = path.resolve(rootPath, compileFile.filename);
        let compilePath = path.resolve(copyPath, compileFile.filename).replace(/\\/g, '\/').split('\/');
        compilePath.splice(compilePath.length - 1, 1);
        compilePath = compilePath.join('/');
        const result = await translateCode({
            format: 'cjs',
            entryPoints: [sourchFile],
            minify: true,
            outdir: compilePath,
        });
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
function checkIsImport(filePath) {
    return new Promise(finished => {
        if (checkIsDir(filePath))
            finished(false);
        const readStream = fs.createReadStream(filePath);
        const rl = readLine__default['default'].createInterface(readStream);
        let isImport = false;
        rl.on('line', (lineData) => {
            if (IMPORT_REG.test(lineData)) {
                isImport = true;
                rl.close();
            }
        });
        rl.on('close', () => {
            finished(isImport);
        });
    });
}
var handleFile = {
    EXPLORE_REG,
    readTsFile,
    main,
    watchFile,
    checkIsImport,
    getDirAllFile,
};

// import childProcess from 'child_process';
class Entry {
    constructor(data) {
        const { configPath, command } = data;
        this.program = command || null;
        this.DEFAULT_MINIPACK_CONFIG_PATH = configPath || path.resolve(__dirname, '../minipack.config.js');
        this.config = config;
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
            }
            else {
                const isFullPath = /^\/.*/.test(this.program.config);
                file = isFullPath ? this.program.config : path.resolve(process.cwd(), this.program.config);
            }
        }
        if (fs.existsSync(file) && fs.statSync(file).isFile()) {
            try {
                let data = require(file);
                Object.assign(this.config, data);
                if (!this.config.tsConfigPath)
                    throw new Error('tsConfigPath must defined');
                if (!fs.existsSync(file) || !fs.statSync(file).isFile())
                    throw new Error('tsConfigPath path is not found');
            }
            catch (err) {
                throw new Error(err.toString());
            }
        }
        else {
            throw new Error(`config file ${file} is not defined`);
        }
    }
    /**
     * start build
     */
    async start() {
        const { watchEntry, outDir, inpouringEnv } = this.config;
        console.log('compile start');
        const fileList = handleFile.readTsFile(watchEntry);
        const compileResult = await translateCode({
            format: 'cjs',
            entryPoints: fileList,
            minify: true,
            outdir: outDir,
        });
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
        }
        else {
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
            }, 1000);
        });
    }
    /**
     * watchFile
     */
    watchFile() {
        const { isWatch, watchEntry, outDir, tsConfigPath, miniprogramProjectConfig, miniprogramProjectPath, inpouringEnv, typeRoots, } = this.config;
        if (isWatch) {
            const watchOption = {
                rootPath: watchEntry,
                copyPath: outDir,
                tsconfigPath: tsConfigPath,
                inpourEnv: inpouringEnv,
                miniprogramProjectPath,
                miniprogramProjectConfig,
                typingDirPath: typeRoots,
            };
            handleFile.watchFile(watchOption);
        }
    }
}

module.exports = Entry;
