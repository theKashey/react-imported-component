import { markMeta } from './loadable';

export const loadByChunkname = (chunkName: string) =>
  Promise.all(markMeta.filter(meta => meta.chunkName === chunkName).map(meta => meta.loadable.load()));
