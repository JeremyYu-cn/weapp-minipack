import {
  createReadStream,
  readFileSync,
  statSync,
} from 'fs';
import readLine from 'readline';
import crypto from 'crypto';
const IMPORT_REG = /import.*from.*/;

/**
 * 判断是否是文件夹
 */
export function checkIsDir(filePath: string) {
  return statSync(filePath).isDirectory();
}

/**
 * 判断两个文件大小是否相等
 */
export function checkFileIsSame(pathA: string, pathB: string) {
  ;
  const fileA_MD5 = crypto.createHash('md5').update(readFileSync(pathA)).digest('hex');
  const fileB_MD5 = crypto.createHash('md5').update(readFileSync(pathB)).digest('hex');
  return fileA_MD5 === fileB_MD5;
}

/**
 *  查看文件是否有import
 * @param filePath 文件路径
 */
 export function checkIsImport(filePath: string): Promise<boolean>{
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