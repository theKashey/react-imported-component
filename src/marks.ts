import {Loadable, Mark, Stream} from "./types";

interface MarkPair {
  mark: Mark;
  loadable: Loadable<any>;
}

let LOADABLE_MARKS = new Map<string, MarkPair>();

export const createLoadableStream = () => ({marks: {}});
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
      throw new Error('react-imported-component: version 6 requires `stream` to be an object. Refer to the migration guide')
    }
  }
};

export const defaultStream = createLoadableStream();

export const useMark = (stream: Stream, marks: string[]) => {
  checkStream(stream || "DEFAULT");
  if (marks && marks.length) {
    marks.forEach(a => stream.marks[a] = true);
  }
};

export const assingLoadableMark = (mark: Mark, loadable: Loadable<any>) => {
  LOADABLE_MARKS.set(JSON.stringify(mark), {mark, loadable});
};

export const getUsedMarks = (stream?: Stream): string[] => (
  stream
    ? Object.keys(stream.marks)
    : []
);

export const drainHydrateMarks = (stream?: Stream) => {
  checkStream(stream);
  const marks = getUsedMarks(stream);
  clearStream(stream);
  return marks;
};


const allIn = (a1: string[], a2: string[]) => a1.filter(mark => a2.indexOf(mark) >= 0).length == a1.length;

export const rehydrateMarks = (marks?: string[]) => {
  const rehydrateMarks: string[] = marks || (global as any).___REACT_DEFERRED_COMPONENT_MARKS || [];
  const tasks: Promise<any>[] = [];

  LOADABLE_MARKS
    .forEach(({mark, loadable}) => {
      if (allIn(mark, rehydrateMarks)) {
        tasks.push(loadable.load())
      }
    });

  return Promise.all(tasks);
};

export const printDrainHydrateMarks = (stream?: Stream) => {
  checkStream(stream);
  return `<script>window.___REACT_DEFERRED_COMPONENT_MARKS=${JSON.stringify(drainHydrateMarks(stream))};</script>`;
};