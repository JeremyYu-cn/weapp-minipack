type PluginFunction = {
    test: RegExp,
    action: (data: IPluginOption) => string
}

declare module miniPack {
    

    interface IPluginOption {
        copyDir: string
        filePath: string
        data: string
        dataBuf: buffer
    }

    interface InpouringEnvOtion {
        /**
         * control inpour env data or not
         */
        isInpour: boolean
        /**
         * inpour files
         */
        files: string[]

        /**
         * inpour data
         */
        data: string
    }

    interface IWatchFileOption {
        /**
         * entry path
         */
        rootPath: string
        /**
         * outputDir
         */
        copyPath: string
        /**
         * ts config file
         */
        tsconfigPath: string

        /**
         * typingDirPath
         */
        typingDirPath: string[]

        /**
         * inpour environment data
         */
        inpourEnv: InpouringEnvOtion

        /**
         * project.config.js json
         */
        miniprogramProjectConfig: Record<string, any>

        /**
         * miniprogram project config path
         */
        miniprogramProjectPath: string
        /**
         * assets file handle plugins 
         */
        plugins?: PluginFunction[]
        /**
         * compile options
         */
        esBuildOptions: esbuild.BuildOptions
    }

    interface ITsFileData {
        /**
         * 文件类型
         */
        type: string;
        /**
         * 执行的文件操作
         */
        event: string;
        /**
         * 文件名
         */
        filename: string;
    }
}

