import { Loadable, Mark, MarkMeta } from '../types';

export const markMeta: MarkMeta[] = [];

export const assignMetaData = (mark: Mark, loadable: Loadable<any>, chunkName: string, fileName: string): void => {
  markMeta.push({ mark, loadable, chunkName, fileName });
};
