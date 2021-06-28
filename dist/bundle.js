'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var path = require('path');
var fs = require('fs');
require('readline');
var crypto = require('crypto');
var esbuild = require('esbuild');
var htmlMinifier = require('html-minifier');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var crypto__default = /*#__PURE__*/_interopDefaultLegacy(crypto);

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
    plugins: [],
};

/**
 * 判断是否是文件夹
 */
function checkIsDir(filePath) {
    return fs.statSync(filePath).isDirectory();
}
/**
 * 判断两个文件大小是否相等
 */
function checkFileIsSame(pathA, pathB) {
    const fileA_MD5 = crypto__default['default'].createHash('md5').update(fs.readFileSync(pathA)).digest('hex');
    const fileB_MD5 = crypto__default['default'].createHash('md5').update(fs.readFileSync(pathB)).digest('hex');
    return fileA_MD5 === fileB_MD5;
}

const EXPLORE_REG = new RegExp(".*.(js|ts)$|.DS_Store");
const TS_REG = /.*\.ts$/;

function handleAssetsFile(tmpPath, endPath, plugins) {
    let formatData = '';
    for (let x of plugins) {
        if (x.test.test(tmpPath) &&
            fs.existsSync(tmpPath) &&
            fs.statSync(tmpPath).isFile()) {
            const data = fs.readFileSync(tmpPath, { encoding: 'utf-8' });
            const actionData = {
                copyDir: endPath,
                filePath: tmpPath,
                data,
                dataBuf: Buffer.alloc(data.length, data),
            };
            formatData = x.action(actionData);
            break;
        }
    }
    if (formatData) {
        fs.writeFileSync(endPath, formatData);
    }
    else {
        copyFile(tmpPath, endPath);
    }
    return true;
}

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
 * 用流的方式复制文件
 */
function copyFile(beginPath, endPath) {
    if (fs.existsSync(beginPath) && !checkIsDir(beginPath)) {
        const readStream = fs.createReadStream(beginPath);
        const writeStream = fs.createWriteStream(endPath);
        readStream.pipe(writeStream);
    }
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
 * 开始编译
 */
async function startCompile(filePath, copyPath, plugins = []) {
    // 读取所有文件
    const fileArr = readDir(filePath);
    for (let x of fileArr) {
        const tmpPath = path.resolve(path.resolve(filePath, x));
        let endPath = path.resolve(copyPath, x);
        if (checkIsDir(tmpPath)) {
            createDir(endPath);
            startCompile(tmpPath, endPath, plugins);
        }
        else if (!EXPLORE_REG.test(endPath) || /\/lib\/.*|\lib\.*/g.test(endPath)) {
            if (fs.existsSync(endPath) && checkFileIsSame(tmpPath, endPath)) {
                continue;
            }
            else {
                handleAssetsFile(tmpPath, endPath, plugins);
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
        return result;
    }
    catch (err) {
        console.log('build err', err);
        return false;
    }
}
/**
 * 编译TS文件
 */
async function actionCompileTsFile(tsFile, rootPath, copyPath, inpourEnv, esBuildOptions) {
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
            ...esBuildOptions,
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
 * 监听文件开始编译
 */
async function actionCompile(fileArr, option) {
    const { rootPath, inpourEnv, miniprogramProjectConfig, miniprogramProjectPath, plugins = [], esBuildOptions, } = option;
    let { copyPath, } = option;
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
        const fileList = readTsFile(rootPath);
        const compileResult = await translateCode({
            format: 'cjs',
            entryPoints: fileList,
            minify: true,
            outdir: copyPath,
            ...esBuildOptions,
        });
        if (compileResult) {
            if (inpourEnv.isInpour) {
                addEnv(copyPath, inpourEnv.files, inpourEnv.data);
            }
            changeMiniprogramConfig(miniprogramProjectConfig, miniprogramProjectPath);
        }
        // 重新写入文件
        startCompile(rootPath, copyPath);
    }
    else {
        // 写入ts文件
        if (tsFile.length) {
            await actionCompileTsFile(tsFile, rootPath, copyPath, inpourEnv, esBuildOptions);
        }
        // 写入修改的文件
        for (let assetFile of assetsFile) {
            handleAssetsFile(path.resolve(rootPath, assetFile.filename), path.resolve(copyPath, assetFile.filename), plugins);
        }
    }
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
 * 压缩HTML CSS文件
 * @param filePath
 * @param endPath
 * @returns
 */
function minifierStyle({ data, }) {
    return htmlMinifier.minify(data, {
        minifyCSS: true,
        removeComments: true,
        collapseWhitespace: true,
        keepClosingSlash: true,
        trimCustomFragments: true,
        caseSensitive: true,
    });
}

function minifyerWxml({ data, }) {
    return data.replace(/\n|\s{2,}/g, ' ').replace(/\/\/.*|<!--.*-->/g, '');
}

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
            const options = this.program.opts();
            if (!options.config) {
                options.config = this.DEFAULT_MINIPACK_CONFIG_PATH;
            }
            else {
                const isFullPath = /^\/.*/.test(options.config);
                file = isFullPath ? options.config : path.resolve(process.cwd(), options.config);
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
        const { watchEntry, outDir, inpouringEnv, esBuildOptions, } = this.config;
        console.log('compile start');
        const fileList = readTsFile(watchEntry);
        const compileResult = await translateCode({
            format: 'cjs',
            entryPoints: fileList,
            minify: true,
            outdir: outDir,
            ...esBuildOptions,
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
        return new Promise(async (truly) => {
            const { watchEntry, outDir, miniprogramProjectConfig, miniprogramProjectPath, plugins, } = this.config;
            console.log('start copy asset files');
            await startCompile(watchEntry, outDir, plugins);
            changeMiniprogramConfig(miniprogramProjectConfig, miniprogramProjectPath);
            console.log('copy assets success');
            truly(true);
        });
    }
    /**
     * watchFile
     */
    watchFile() {
        const { isWatch, watchEntry, outDir, tsConfigPath, miniprogramProjectConfig, miniprogramProjectPath, inpouringEnv, typeRoots, plugins, esBuildOptions = {}, } = this.config;
        if (isWatch) {
            const watchOption = {
                rootPath: watchEntry,
                copyPath: outDir,
                tsconfigPath: tsConfigPath,
                inpourEnv: inpouringEnv,
                miniprogramProjectPath,
                miniprogramProjectConfig,
                typingDirPath: typeRoots,
                plugins,
                esBuildOptions,
            };
            watchFile(watchOption);
        }
    }
}
const minifyStyle = minifierStyle;
const minifyWxml = minifyerWxml;

exports.Entry = Entry;
exports.minifyStyle = minifyStyle;
exports.minifyWxml = minifyWxml;
