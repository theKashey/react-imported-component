import { Transform } from 'stream';
import { getUsedMarks } from '../loadable/marks';
import { Stream } from '../types';

type LoadableStreamCallback = (marks: string[]) => string;

export const createLoadableTransformer = (stream: Stream, callback: LoadableStreamCallback) => {
  const usedMarks = new Set<string>();
  return new Transform({
    // transform() is called with each chunk of data
    // tslint:disable-next-line:variable-name
    transform(chunk, _, _callback) {
      const marks = getUsedMarks(stream);
      const newMarks: string[] = [];
      marks.forEach(mark => {
        if (!usedMarks.has(mark)) {
          newMarks.push(mark);
          usedMarks.add(mark);
        }
      });
      const chunkData = Buffer.from(chunk, 'utf-8');

      _callback(undefined, callback(newMarks) + chunkData);
    },
  });
};
