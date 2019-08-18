import {Loadable, Mark} from "./types";

interface MarkPair {
  mark: Mark;
  loadable: Loadable<any>;
}

let LOADABLE_MARKS = new Map<string, MarkPair>();
let USED_MARKS: Record<number, Record<string, boolean>> = {};

export const useMark = (stream: number, marks: string[]) => {
  if (marks && marks.length) {
    if (!USED_MARKS[stream]) {
      USED_MARKS[stream] = {};
    }
    marks.forEach(a => USED_MARKS[stream][a] = true);
  }
};

export const assingLoadableMark = (mark: Mark, loadable: Loadable<any>) => {
  LOADABLE_MARKS.set(JSON.stringify(mark), {mark, loadable});
};

export const getUsedMarks = (stream: number) => USED_MARKS[stream] || {};

export const drainHydrateMarks = (stream = 0) => {
  const used = Object.keys(getUsedMarks(stream));
  // free mem
  delete USED_MARKS[stream];

  return used;
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

export const printDrainHydrateMarks = (stream = 0) => {
  return `<script>window.___REACT_DEFERRED_COMPONENT_MARKS=${JSON.stringify(drainHydrateMarks(stream))};/*stream ${stream}*/</script>`;
};