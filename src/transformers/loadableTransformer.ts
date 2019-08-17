import {Transform} from 'stream';
import {getUsedMarks} from "../marks";

type LoadableStreamCallback = (marks: string[]) => string;

export const createLoadableStream = (stream: number, callback: LoadableStreamCallback) => {
  const usedMarks = new Set<string>();
  return new Transform({
    // transform() is called with each chunk of data
    transform(chunk, _, _callback) {
      const marks = getUsedMarks(stream);
      const newMarks: string[] = [];
      Object
        .keys(marks)
        .forEach(mark => {
          if (!usedMarks.has(mark)) {
            newMarks.push(mark);
            usedMarks.add(mark);
          }
        });
      const chunkData = Buffer.from(chunk, 'utf-8');

      _callback(
        undefined,
        callback(newMarks) + chunkData
      );
    },
  });
};