import { Loadable, Mark, Stream } from '../types';

interface MarkPair {
  mark: Mark;
  loadable: Loadable<any>;
}

const LOADABLE_MARKS = new Map<string, MarkPair>();

export const createLoadableStream = () => ({ marks: {} });
const clearStream = (stream?: Stream) => {
  if (stream) {
    stream.marks = {};
  }
};
const checkStream = (stream: Stream | number | string | undefined) => {
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

export const useMark = (stream: Stream = defaultStream, marks: string[]) => {
  checkStream(stream);
  if (marks && marks.length) {
    marks.forEach(a => (stream.marks[a] = true));
  }
};

export const assingLoadableMark = (mark: Mark, loadable: Loadable<any>) => {
  LOADABLE_MARKS.set(JSON.stringify(mark), { mark, loadable });
};

export const getUsedMarks = (stream: Stream = defaultStream): string[] => (stream ? Object.keys(stream.marks) : []);

/**
 * SSR
 * @returns list or marks used
 */
export const drainHydrateMarks = (stream: Stream = defaultStream) => {
  checkStream(stream);
  const marks = getUsedMarks(stream);
  clearStream(stream);
  return marks;
};

export const markerOverlap = (a1: string[], a2: string[]) =>
  a1.filter(mark => a2.indexOf(mark) >= 0).length === a1.length;

/**
 * Loads a given marks/chunks
 * @param marks
 * @returns a resolution promise
 */
export const rehydrateMarks = (marks?: string[]) => {
  const rehydratedMarks: string[] = marks || (global as any).___REACT_DEFERRED_COMPONENT_MARKS || [];
  const tasks: Array<Promise<any>> = [];

  const usedMarks = new Set<string>();

  LOADABLE_MARKS.forEach(({ mark, loadable }) => {
    if (markerOverlap(mark, rehydratedMarks)) {
      mark.forEach(m => usedMarks.add(m));
      tasks.push(loadable.load());
    }
  });

  rehydratedMarks.forEach(m => {
    if (!usedMarks.has(m)) {
      throw new Error(
        `react-imported-component: unknown mark(${m}) has been used. Client and Server should have the same babel configuration.`
      );
    }
  });

  return Promise.all(tasks);
};

/**
 * waits for the given marks to load
 * @param marks
 */
export const waitForMarks = (marks: string[]) => {
  const tasks: Array<Promise<any>> = [];

  LOADABLE_MARKS.forEach(({ mark, loadable }) => {
    if (markerOverlap(mark, marks)) {
      tasks.push(loadable.resolution);
    }
  });

  return Promise.all(tasks);
};

/**
 * @returns a <script> tag with all used marks
 */
export const printDrainHydrateMarks = (stream?: Stream) => {
  checkStream(stream);
  return `<script>window.___REACT_DEFERRED_COMPONENT_MARKS=${JSON.stringify(drainHydrateMarks(stream))};</script>`;
};
