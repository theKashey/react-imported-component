import {Mark, MarkMeta} from "./types";
import {markMeta} from "./loadable";
import {markerOverlap} from "./marks";

const getMarkedMeta = (marks: Mark, mapping: (meta: MarkMeta) => string) => (
  (new Set(
    markMeta
      .filter(meta => markerOverlap(meta.mark, marks))
      .map(mapping)
      .filter(Boolean)
  )).values()
);

export const getMarkedChunks = (marks: Mark) => getMarkedMeta(marks, meta => meta.chunkName);
export const getMarkedFileNames = (marks: Mark) => getMarkedMeta(marks, meta => meta.fileName);