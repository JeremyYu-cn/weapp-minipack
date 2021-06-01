'use strict';

var childProcess = require('child_process');
var path = require('path');
var fs = require('fs');
var readLine = require('readline');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var childProcess__default = /*#__PURE__*/_interopDefaultLegacy(childProcess);
var readLine__default = /*#__PURE__*/_interopDefaultLegacy(readLine);

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __generator(thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
}

/**
 * default config
 */
var config = {
    env: process.env.NODE_ENV || 'none',
    entry: '',
    outDir: path.resolve(__dirname, '../dist'),
    isTs: true,
    tsConfigPath: path.resolve(__dirname, '../tsconfig.json'),
    miniprogramProjectPath: path.resolve(__dirname, '../project.config.json'),
    miniprogramProjectConfig: {},
    isWatch: false,
    inpouringEnv: {
        isInpour: false,
        files: [],
        data: '',
    },
    typeRoots: [],
};

var PROJECT_CONFIG_PATH = path.resolve(__dirname, '../project.config.json');
/**
 * 改变小程序配置
 */
function changeMiniprogramConfig(config, configPath) {
    if (config === void 0) { config = {}; }
    if (configPath === void 0) { configPath = PROJECT_CONFIG_PATH; }
    if (fs.existsSync(configPath)) {
        var data = fs.readFileSync(configPath, { encoding: 'utf-8' });
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
    for (var _i = 0, configFile_1 = configFile; _i < configFile_1.length; _i++) {
        var x = configFile_1[_i];
        var file = path.resolve(rootPath, x);
        if (fs.existsSync(file) && fs.statSync(file).isFile()) {
            var data = fs.readFileSync(file, { encoding: 'utf-8' });
            console.log(env);
            fs.writeFileSync(file, [env, '\r\n', data.replace(new RegExp(env, 'g'), '')].join(''));
        }
    }
}

// 对象数组去重
function filterObject(arr) {
    var obj = {};
    var result = [];
    arr.forEach(function (val) {
        var key = val.type + "_" + val.event + "_" + val.filename;
        if (!obj[key]) {
            obj[key] = 1;
            result.push(val);
        }
    });
    return result;
}

var EXPLORE_REG = new RegExp(".*.(js|ts)$|.DS_Store");
var TS_REG = /.*\.ts$/;
var IMPORT_REG = /import.*from.*/;
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
 * 复制所有文件
 */
function copyFile(beginPath, endPath) {
    if (fs.existsSync(beginPath) && !checkIsDir(beginPath)) {
        var readStream = fs.createReadStream(beginPath);
        var writeStream = fs.createWriteStream(endPath);
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
    var fileASize = fs.statSync(pathA).size;
    var fileBSize = fs.statSync(pathB).size;
    return fileASize === fileBSize;
}
/**
 * 拷贝文件
 */
function main(filePath, copyPath) {
    return __awaiter(this, void 0, void 0, function () {
        var fileArr, _i, fileArr_1, x, tmpPath, endPath;
        return __generator(this, function (_a) {
            fileArr = readDir(filePath);
            for (_i = 0, fileArr_1 = fileArr; _i < fileArr_1.length; _i++) {
                x = fileArr_1[_i];
                tmpPath = path.resolve(path.resolve(filePath, x));
                endPath = path.resolve(copyPath, x);
                if (checkIsDir(tmpPath)) {
                    createDir(endPath);
                    main(tmpPath, endPath);
                }
                else {
                    if (!EXPLORE_REG.test(endPath) || /\/lib\/.*|\lib\.*/g.test(endPath)) {
                        if (fs.existsSync(endPath) && checkFileIsSame(tmpPath, endPath)) {
                            continue;
                        }
                        else {
                            copyFile(tmpPath, endPath);
                        }
                    }
                }
            }
            return [2 /*return*/];
        });
    });
}
/**
 * 读取所有ts文件
 */
function readTsFile(obj, filePath, currentPath) {
    if (currentPath === void 0) { currentPath = ''; }
    var fileArr = readDir(filePath);
    for (var _i = 0, fileArr_2 = fileArr; _i < fileArr_2.length; _i++) {
        var x = fileArr_2[_i];
        var tmpPath = path.resolve(path.resolve(filePath, x));
        var keyPath = currentPath + "/" + x;
        if (checkIsDir(tmpPath)) {
            readTsFile(obj, tmpPath, keyPath);
        }
        else {
            if (TS_REG.test(keyPath)) {
                var key = keyPath.replace(/.ts$/, '');
                obj[key] = tmpPath;
            }
        }
    }
}
/**
 * 监听文件改动
 */
var changeFileArr = [];
var watchFileTimer = null;
function watchFile(option, during) {
    if (during === void 0) { during = 500; }
    console.log('开始监听文件');
    var rootPath = option.rootPath;
    fs.watch(rootPath, { recursive: true, }, function (event, filename) {
        clearTimeout(watchFileTimer);
        changeFileArr.push({
            type: EXPLORE_REG.test(filename) ? 'ts' : 'asset',
            event: event,
            filename: filename,
        });
        watchFileTimer = setTimeout(function () {
            actionCompile(changeFileArr, option);
            changeFileArr = [];
        }, during);
    });
}
/**
 * 监听文件开始编译
 */
function actionCompile(fileArr, option) {
    return __awaiter(this, void 0, void 0, function () {
        var rootPath, tsconfigPath, inpourEnv, miniprogramProjectConfig, miniprogramProjectPath, typingDirPath, copyPath, isReadName, assetsFile, tsFile, compileResult, _i, assetsFile_1, assetFile;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    rootPath = option.rootPath, tsconfigPath = option.tsconfigPath, inpourEnv = option.inpourEnv, miniprogramProjectConfig = option.miniprogramProjectConfig, miniprogramProjectPath = option.miniprogramProjectPath, typingDirPath = option.typingDirPath;
                    copyPath = option.copyPath;
                    // 对象去重
                    fileArr = filterObject(fileArr);
                    isReadName = fileArr.filter(function (val) { return val.event === 'rename'; }).length > 0;
                    assetsFile = fileArr.filter(function (val) { return val.type === 'asset'; });
                    tsFile = fileArr.filter(function (val) { return val.type === 'ts'; });
                    if (!isReadName) return [3 /*break*/, 1];
                    compileResult = childProcess__default['default'].spawnSync('tsc', ['--project', tsconfigPath, '--outDir', copyPath], { shell: true });
                    if (compileResult.status === 0) {
                        if (inpourEnv.isInpour) {
                            addEnv(copyPath, inpourEnv.files, inpourEnv.data);
                        }
                        changeMiniprogramConfig(miniprogramProjectConfig, miniprogramProjectPath);
                    }
                    // 重新写入文件
                    main(rootPath, copyPath);
                    return [3 /*break*/, 4];
                case 1:
                    if (!tsFile.length) return [3 /*break*/, 3];
                    return [4 /*yield*/, actionCompileTsFile(tsFile, rootPath, copyPath, typingDirPath, inpourEnv)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    // 写入修改的文件
                    for (_i = 0, assetsFile_1 = assetsFile; _i < assetsFile_1.length; _i++) {
                        assetFile = assetsFile_1[_i];
                        copyFile(path.resolve(rootPath, assetFile.filename), path.resolve(copyPath, assetFile.filename));
                    }
                    _a.label = 4;
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * 编译TS文件
 */
function actionCompileTsFile(tsFile, rootPath, copyPath, typingDirPath, inpourEnv) {
    return __awaiter(this, void 0, void 0, function () {
        var sourcePath, outDirArr, _i, tsFile_1, compileFile, sourchFile, isImport, compilePath, args, compileResult;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    sourcePath = [];
                    outDirArr = [];
                    _i = 0, tsFile_1 = tsFile;
                    _a.label = 1;
                case 1:
                    if (!(_i < tsFile_1.length)) return [3 /*break*/, 4];
                    compileFile = tsFile_1[_i];
                    if (!TS_REG.test(compileFile.filename)) return [3 /*break*/, 3];
                    sourchFile = path.resolve(rootPath, compileFile.filename);
                    return [4 /*yield*/, checkIsImport(sourchFile)];
                case 2:
                    isImport = _a.sent();
                    compilePath = path.resolve(copyPath, compileFile.filename).replace(/\\/g, '\/').split('\/');
                    compilePath.splice(compilePath.length - 1, 1);
                    compilePath = compilePath.join('/');
                    sourcePath.push("" + sourchFile);
                    outDirArr = outDirArr.concat(["--outDir", isImport ? copyPath : compilePath, sourchFile]);
                    _a.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4:
                    if (sourcePath.length) {
                        console.log(sourcePath);
                        console.log('正在编译指定文件');
                        console.time('compile');
                        args = sourcePath.concat([
                            '--lib', 'es6,ES2017.Object,ES2015.Promise',
                        ], outDirArr);
                        if (typingDirPath.length)
                            args = args.concat(['--types', typingDirPath.join(',')]);
                        compileResult = childProcess__default['default'].spawnSync('tsc', args, { shell: true, });
                        console.log(compileResult.stdout ? compileResult.stdout.toString() : compileResult.error);
                        if (inpourEnv.isInpour) {
                            addEnv(copyPath, inpourEnv.files, inpourEnv.data);
                        }
                        console.log('编译完成');
                        console.timeEnd('compile');
                    }
                    return [2 /*return*/];
            }
        });
    });
}
/**
 *  查看文件是否有import
 * @param filePath 文件路径
 */
function checkIsImport(filePath) {
    return new Promise(function (finished) {
        if (checkIsDir(filePath))
            finished(false);
        var readStream = fs.createReadStream(filePath);
        var rl = readLine__default['default'].createInterface(readStream);
        var isImport = false;
        rl.on('line', function (lineData) {
            if (IMPORT_REG.test(lineData)) {
                isImport = true;
                rl.close();
            }
        });
        rl.on('close', function () {
            finished(isImport);
        });
    });
}
var handleFile = {
    EXPLORE_REG: EXPLORE_REG,
    readTsFile: readTsFile,
    main: main,
    watchFile: watchFile,
    checkIsImport: checkIsImport,
};

var Entry = /** @class */ (function () {
    function Entry(data) {
        var configPath = data.configPath, command = data.command;
        this.program = command || null;
        this.DEFAULT_MINIPACK_CONFIG_PATH = configPath || path.resolve(__dirname, '../minipack.config.js');
        this.config = config;
    }
    /**
     * init project
     */
    Entry.prototype.init = function () {
        this.setConfig();
        return this;
    };
    /**
     * setting bundler config
     */
    Entry.prototype.setConfig = function () {
        var file = this.DEFAULT_MINIPACK_CONFIG_PATH;
        if (this.program) {
            // get config file
            if (!this.program.config) {
                this.program.config = this.DEFAULT_MINIPACK_CONFIG_PATH;
            }
            else {
                var isFullPath = /^\/.*/.test(this.program.config);
                file = isFullPath ? this.program.config : path.resolve(process.cwd(), this.program.config);
            }
        }
        console.log('config file', file);
        if (fs.existsSync(file) && fs.statSync(file).isFile()) {
            try {
                var data = require(file);
                Object.assign(this.config, data);
            }
            catch (err) {
                throw new Error(err.toString());
            }
        }
        else {
            throw new Error("config file " + file + " is not defined");
        }
    };
    /**
     * start build
     */
    Entry.prototype.start = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, tsConfigPath, outDir, inpouringEnv, result;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this.config, tsConfigPath = _a.tsConfigPath, outDir = _a.outDir, inpouringEnv = _a.inpouringEnv;
                        console.log('compile start');
                        result = childProcess__default['default'].spawnSync("tsc", ["--project", tsConfigPath, '--outDir', outDir,], { shell: true, });
                        if (!(result.status === 0)) return [3 /*break*/, 2];
                        console.log('compile finished');
                        if (inpouringEnv.isInpour) {
                            console.log('start inpour data');
                            addEnv(outDir, inpouringEnv.files, inpouringEnv.data);
                            console.log('inpour finished');
                        }
                        return [4 /*yield*/, this.copyFile()];
                    case 1:
                        _b.sent();
                        this.watchFile();
                        return [3 /*break*/, 3];
                    case 2:
                        console.log(result.stdout.toString('utf-8'));
                        return [2 /*return*/];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * copy other asset files
     */
    Entry.prototype.copyFile = function () {
        var _this = this;
        return new Promise(function (truly) {
            var _a = _this.config, entry = _a.entry, outDir = _a.outDir, miniprogramProjectConfig = _a.miniprogramProjectConfig, miniprogramProjectPath = _a.miniprogramProjectPath;
            console.log('start copy asset files');
            setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, handleFile.main(entry, outDir)];
                        case 1:
                            _a.sent();
                            changeMiniprogramConfig(miniprogramProjectConfig, miniprogramProjectPath);
                            console.log('copy assets success');
                            truly(true);
                            return [2 /*return*/];
                    }
                });
            }); }, 1000);
        });
    };
    /**
     * watchFile
     */
    Entry.prototype.watchFile = function () {
        var _a = this.config, isWatch = _a.isWatch, entry = _a.entry, outDir = _a.outDir, tsConfigPath = _a.tsConfigPath, miniprogramProjectConfig = _a.miniprogramProjectConfig, miniprogramProjectPath = _a.miniprogramProjectPath, inpouringEnv = _a.inpouringEnv, typeRoots = _a.typeRoots;
        if (isWatch) {
            var watchOption = {
                rootPath: entry,
                copyPath: outDir,
                tsconfigPath: tsConfigPath,
                inpourEnv: inpouringEnv,
                miniprogramProjectPath: miniprogramProjectPath,
                miniprogramProjectConfig: miniprogramProjectConfig,
                typingDirPath: typeRoots,
            };
            handleFile.watchFile(watchOption);
        }
    };
    return Entry;
}());

module.exports = Entry;
