import { translateCode } from '../src/compile/compile';
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



