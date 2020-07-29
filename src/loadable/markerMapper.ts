import { Mark, MarkMeta } from '../types';
import { markerOverlap } from './marks';
import { markMeta } from './metadata';

const getMarkedMeta = (marks: Mark, mapping: (meta: MarkMeta) => string) => {
  if (markMeta.length === 0) {
    throw new Error('react-imported-component: no import meta-information found. Have you imported async-requires?');
  }

  return Array.from(
    new Set(
      markMeta
        .filter(meta => markerOverlap(meta.mark, marks))
        .map(mapping)
        .filter(Boolean)
    ).values()
  );
};

export const getMarkedChunks = (marks: Mark) => getMarkedMeta(marks, meta => meta.chunkName);
export const getMarkedFileNames = (marks: Mark) => getMarkedMeta(marks, meta => meta.fileName);
