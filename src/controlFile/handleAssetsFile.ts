import { minifierHtml } from "../compile/compile";
import { HTML_CSS_REG } from "../globalConfig";
import { copyFile } from "./readFile";

export function handleAssetsFile(tmpPath: string, endPath: string): boolean{
  if (HTML_CSS_REG.test(tmpPath)) {
    minifierHtml(tmpPath, endPath);
  } else {
    copyFile(tmpPath, endPath);
  }
  return true;
}
