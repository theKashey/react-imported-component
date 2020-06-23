import { markMeta } from './loadable';

/**
 * loads chunk by a known chunkname
 * @param {String} chunkName
 */
export const loadByChunkname = (chunkName: string) =>
  Promise.all(markMeta.filter(meta => meta.chunkName === chunkName).map(meta => meta.loadable.load()));
