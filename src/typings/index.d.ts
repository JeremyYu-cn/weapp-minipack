
declare module miniPack {
    interface IConfigOption {
        /**
         * current bundler env
         */
        env: string

        /**
         * your program's watch file entry path
         */
         watchEntry: string

        /**
         * output file root path
         */
        outDir: string

        /**
         * typescript's config file path
         * if param "isTs" is false, you can ignore it
         */
        tsConfigPath: string

        /**
         * set use program language
         */
        isTs: boolean

        /**
         * wechat miniprogram project.config.json path
         */
        miniprogramProjectPath: string

        /**
         * wechat miniProgram project.config.json param
         * you can change project config after the first bundle finished
         */
        miniprogramProjectConfig: Record<string, any>

        /**
         * inpouring env data option
         */
        inpouringEnv: InpouringEnvOtion

        /**
         * whether watch file change to compile or not
         */
        isWatch: boolean

        /**
         * tsconfig typeRoots 
         */
        typeRoots: string[]
        
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

