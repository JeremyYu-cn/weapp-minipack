import { translateCode } from '../src/compile/compile';
// import readFile from '../src/readFile';
import path from 'path';

const entry = [
  path.resolve(__dirname, 'compileCode', 'index.ts'),
  path.resolve(__dirname, 'compileCode', 'a.ts'),
  path.resolve(__dirname, 'compileCode', 'child', 'child.ts'),
  path.resolve(__dirname, 'compileCode', 'child', 'child2', 'child2.ts'),
]

/**
 * 测试esbuild编译代码
 */
test('translate code', async () => {
  const result = await translateCode({
    entryPoints: entry,
    minify: true,
    outdir: path.resolve(__dirname, 'build'),
  })
  expect(result).toBeTruthy();
});

// /**
//  * 测试读取所有文件
//  */
// test('get file path', async () => {
//   const fileDir = path.resolve(__dirname, 'compileCode');
//   const arr = readFile.getDirAllFile(fileDir);
//   expect(true).toBeTruthy();
// })

// /**
//  * 测试读取所有文件
//  */
//  test('get file path', async () => {
//   const fileDir = path.resolve(__dirname, 'compileCode');
//   const arr = readFile.getDirAllFile(fileDir);
//   expect(true).toBeTruthy();
// })


