
export function minifyerWxml({ data, }: miniPack.IPluginOption): string {
  return data.replace(/\n|\s{2,}/g, ' ').replace(/\/\/.*|<!--.*-->/g, '')
}
