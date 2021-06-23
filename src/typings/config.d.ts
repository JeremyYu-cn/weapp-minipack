export type miniPackConfigOption = {
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
  
  /**
   * plugins
   */
  plugins?: PluginFunction[]

  /**
   * compile options
   */
   esBuildOptions?: esbuild.BuildOptions
}