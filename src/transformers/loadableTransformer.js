import {Transform} from 'stream';
import {getUsedMarks} from "../marks";

export const createLoadalbeStream = (stream, callback) => {
  const usedMarks = new Set();
  return new Transform({
    // transform() is called with each chunk of data
    transform(chunk, _, _callback) {
      const marks = getUsedMarks(stream);
      const newMarks = [];
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