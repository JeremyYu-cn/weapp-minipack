import { readFileSync, writeFileSync } from "fs";
import { copyFile } from "./readFile";

export function handleAssetsFile(tmpPath: string, endPath: string, plugins: PluginFunction[])
: boolean
{
  let formatData = '';
  for(let x of plugins) {
    if(x.test.test(tmpPath)) {
      const data = readFileSync(tmpPath, { encoding: 'utf-8' });
      const actionData: miniPack.IPluginOption = {
        copyDir: endPath,
        filePath: tmpPath,
        data,
        dataBuf: Buffer.alloc(data.length, data),
      }
      formatData = x.action(actionData)
      break;
    } 
  }

  if (formatData) {
    writeFileSync(endPath, formatData);
  } else {
    copyFile(tmpPath, endPath);
  }
  return true;
}
