// 对象数组去重
export function filterObject(arr: miniPack.ITsFileData[]): miniPack.ITsFileData[] {
  const obj: Record<string, any> = {};
  const result: miniPack.ITsFileData[] = [];
  arr.forEach(val => {
      const key = `${ val.type }_${ val.event }_${ val.filename }`
      if (!obj[ key ]) {
          obj[ key ] = 1;
          result.push(val);
      }
  })
  return result;
}