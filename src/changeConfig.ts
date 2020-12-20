import { existsSync, readFileSync, writeFileSync, statSync } from 'fs';
import { resolve } from 'path';
const PROJECT_CONFIG_PATH = resolve(__dirname, '../project.config.json');
/**
 * 改变小程序配置
 */
function changeMiniprogramConfig(config = {}, configPath = PROJECT_CONFIG_PATH) {
  if (existsSync(configPath)) {
    let data = readFileSync(configPath, { encoding: 'utf-8' });
    try {
      data = JSON.parse(data);
      Object.assign(data, config);
      data = JSON.stringify(data).replace(/{/g, '{\r\n')
      .replace(/}/g, '}\r\n').replace(/,/g, ',\r\n')
      .replace(/\[/g, '[\r\n').replace(/\]/g, ']\r\n')
      writeFileSync(configPath, data);
    } catch(err) {
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
function addEnv(rootPath: string, configFile: string[], env: string) {
  for (let x of configFile) {
    const file = resolve(rootPath, x);
    if (existsSync(file) && statSync(file).isFile()) {
      const data = readFileSync(file, { encoding: 'utf-8' });
      writeFileSync(file, [env, '\r\n', data.replace(new RegExp(env, 'g'), '')].join(''))
    }
  }
}
export {
  changeMiniprogramConfig,
  addEnv,
}
