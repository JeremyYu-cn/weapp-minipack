import esbuild, { build } from 'esbuild';

export async function translateCode(options: esbuild.BuildOptions) {
  try {
    const result = await build(options);
    console.log('build result', result);
    return result;
  } catch(err) {
    console.log('build err', err);
    return false;
  }
  
}

