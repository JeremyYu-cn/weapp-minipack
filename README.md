# weapp-pack

一个利用typescript打包小程序的工具


## 安装

>  npm install weapp-minipack -g

>  yarn global add weapp-minipack

## 使用(cli)

>  weapp-minipack -c ./minipack.config.js

  ```javascript
    // minipack.config.js
    const path = require('path');
    module.exports = {
      watchEntry: path.resolve(__dirname, 'miniprogram'),
      tsConfigPath: path.resolve(__dirname, 'tsconfig.json'),
      outDir: path.resolve(__dirname, 'build'),
      isWatch: true,
      watchEntry: path.resolve(__dirname, 'src'),
      typeRoots: [
          path.resolve(__dirname, './typings'),
          path.resolve(__dirname, 'node_modules/@types/node')
      ],
    }
  ```

## config配置

* env: **string** 当前的运行环境
* watchEntry: **string** 监听文件变化时，复制TS意外的文件时使用的入口文件夹
* outDir: **string** 输出的目录,
* isTs: **string** 代码是否为typescript(待用),
* tsConfigPath: **string** tsconfig.json文件路径
* miniprogramProjectPath: **string** 小程序project.config.json配置文件路径,
* miniprogramProjectConfig: **object** 需要修改 project.config.json 中的数据,
* isWatch: **boolean** 是否开启监听文件变化,
* inpouringEnv: **Object** 注入环境变量
* inpouringEnv.isInpour **boolean 是否注入
* inpouringEnv.files **array string** 需要注入的文件路径
* inpouringEnv.data **string** 需要注入的信息
* plugins 处理其他文件的插件
* esBuildOptions 参考[esbuild](https://esbuild.github.io/api/)

## plugins
你可以使用其他插件去处理不同的文件，例如wxml，wxss代码压缩等，
plugins接受一个对象数组
```javascript
  plugins: [
    {
      test: /.*\.wxml$/,
      action: ({ data, dataBuf, filePath, copyPath }) => {
        //handle function
        ....
      }
    }
  ]
```
* test: 匹配文件的正则表达式
* action: 处理匹配到的文件函数
action函数会传入一个`IPluginOption`类型的对象   

* IPluginOption.data string 对应文件的字符串表示
* IPluginOption.dataBuf Buffer 对应文件的buffer
* IPluginOption.filePath string 对应文件的路径
* IPluginOption.copyPath string 编译的目标路径

在minipack中还内置了wxss压缩插件
```javascript
  const { minifierStyle } = require('weapp_minipack');
  // minipack.config.js
  plugins: [
      {
          test: /.*\.(wxss)$/,
          action: minifierStyle,
      }
  ]
```

## 使用(调用实例方法)

```javascript
  const { Entry } = require('weapp-minipack');
  const path = require('path');
  const pack = new Entry({ configPath: path.resolve(__dirname, '..', 'minipack.config.js') });
  pack.init().start();
```

