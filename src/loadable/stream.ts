import { Stream } from '../types';

export const createLoadableStream = (): Stream => ({ marks: {} });

export const clearStream = (stream?: Stream): void => {
  if (stream) {
    stream.marks = {};
  }
};

export const checkStream = (stream: Stream | number | string | undefined): void => {
  if (process.env.NODE_ENV !== 'production') {
    if (!stream) {
      return;
    }

    if (typeof stream !== 'object' || !stream.marks) {
      throw new Error(
        'react-imported-component: version 6 requires `stream` to be an object. Refer to the migration guide'
      );
    }
  }
};

export const defaultStream = createLoadableStream();
