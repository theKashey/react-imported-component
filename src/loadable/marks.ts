import { Loadable, Mark, Stream } from '../types';
import { checkStream, clearStream, defaultStream } from './stream';
import { markerOverlap } from './utils';

interface MarkPair {
  mark: Mark;
  loadable: Loadable<any>;
}

const LOADABLE_MARKS = new Map<string, MarkPair>();

export const consumeMark = (stream: Stream = defaultStream, marks: string[]): void => {
  checkStream(stream);

  if (marks && marks.length) {
    marks.forEach((a) => (stream.marks[a] = true));
  }
};

export const assignLoadableMark = (mark: Mark, loadable: Loadable<any>): void => {
  LOADABLE_MARKS.set(JSON.stringify(mark), { mark, loadable });
};

/**
 * returns marks used in the stream
 * @param stream
 */
export const getUsedMarks = (stream: Stream = defaultStream): string[] => (stream ? Object.keys(stream.marks) : []);

/**
 * SSR
 * @returns list or marks used
 */
export const drainHydrateMarks = (stream: Stream = defaultStream): string[] => {
  checkStream(stream);

  const marks = getUsedMarks(stream);
  clearStream(stream);

  return marks;
};

/**
 * Loads a given marks/chunks
 * @see returns a promise for a given marks only. In order to await all requests currently in flight use {@link waitForMarks}
 * @param marks
 * @returns a resolution promise
 */
export const rehydrateMarks = (marks?: string[]): Promise<unknown> => {
  const rehydratedMarks: string[] = marks || (global as any).___REACT_DEFERRED_COMPONENT_MARKS || [];
  const tasks: Array<Promise<any>> = [];

  const usedMarks = new Set<string>();

  console.log({rehydratedMarks,LOADABLE_MARKS })

  LOADABLE_MARKS.forEach(({ mark, loadable }) => {
    if (markerOverlap(mark, rehydratedMarks)) {
      mark.forEach((m) => usedMarks.add(m));
      tasks.push(loadable.load());
    }
  });

  rehydratedMarks.forEach((m) => {
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
export const waitForMarks = (marks: string[]): Promise<unknown> => {
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
export const printDrainHydrateMarks = (stream?: Stream): string => {
  checkStream(stream);

  return `<script>window.___REACT_DEFERRED_COMPONENT_MARKS=${JSON.stringify(drainHydrateMarks(stream))};</script>`;
};
