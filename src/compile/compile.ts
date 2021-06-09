import esbuild, { build } from 'esbuild';

export async function translateCode(options: esbuild.BuildOptions) {
  const result = await build(options);
  return true;
}

