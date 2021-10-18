import { markMeta } from './metadata';

/**
 * loads chunk by a known chunkname
 * @param {String} chunkName
 */
export const loadByChunkname = (chunkName: string): Promise<unknown> =>
  Promise.all(markMeta.filter((meta) => meta.chunkName === chunkName).map((meta) => meta.loadable.load()));
