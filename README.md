# weapp-pack

一个利用typescript小程序的打包工具


## 安装

  npm install weapp-pack -g

  yarn global add weapp-pack


## 使用(cli)

  minipack -c ./minipack.config.js

  ```javascript
    // minipack.config.js
    const path = require('path');
    module.exports = {
        entry: path.resolve(__dirname, 'src'),
        outDir: path.resolve(__dirname, 'build'),
        isWatch: true,
        typeRoots: [
            path.resolve(__dirname, './typings'),
            path.resolve(__dirname, 'node_modules/@types/node')
        ],
    }
  ```

## config配置

* env: **string** 当前的运行环境
* entry: **string** 小程序入口文件夹
* outDir: **string** 输出的目录,
* isTs: **string** 代码是否为typescript(待用),
* tsConfigPath: **string** tsconfig.json文件路径
* miniprogramProjectPath: **string** 小程序project.config.json配置文件路径,
* miniprogramProjectConfig: **object** 需要修改 project.config.json 中的数据,
* isWatch: boolean 是否开启监听文件变化,
* inpouringEnv: Object 注入环境变量
* inpouringEnv.isInpour boolean 是否注入
* inpouringEnv.files array string 需要注入的文件路径
* inpouringEnv.data string 需要注入的信息


## 使用(调用实例方法)

```javascript
  const MiniPack = require('weapp-pack');
  const path = require('path');
  const pack = new MiniPack({ configPath: path.resolve(__dirname, '..', 'minipack.config.js') });
  pack.init().start();
```

