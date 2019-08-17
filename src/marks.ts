import {Loadable} from "./types";

let LOADABLE_MARKS: Record<string, any> = {};
let USED_MARKS: Record<number, Record<string, boolean>> = {};

export const useMark = (stream: number, marks: string[]) => {
  if (marks && marks.length) {
    if (!USED_MARKS[stream]) {
      USED_MARKS[stream] = {};
    }
    marks.forEach(a => USED_MARKS[stream][a] = true);
  }
};

export const loadMark = (markId: string, loadable: Loadable<any>) => {
  if (!LOADABLE_MARKS[markId]) {
    LOADABLE_MARKS[markId] = []
  }
  LOADABLE_MARKS[markId].push(loadable)
};

export const getUsedMarks = (stream: number) => USED_MARKS[stream] || {};

export const drainHydrateMarks = (stream = 0) => {
  const used = Object.keys(getUsedMarks(stream));
  // free mem
  delete USED_MARKS[stream];

  return used;
};

export const rehydrateMarks = (marks?: string[]) => {
  const rehydrate: string[] = marks || (global as any).___REACT_DEFERRED_COMPONENT_MARKS || [];

  return Promise.all(
    rehydrate
      .map(mark => LOADABLE_MARKS[mark])
      .reduce((acc, loadable) => [...acc, ...loadable], [])
      .filter((it: any) => !!it)
      .map((loadable: Loadable<any>) => loadable.load())
  );
};

export const printDrainHydrateMarks = (stream = 0) => {
  return `<script>window.___REACT_DEFERRED_COMPONENT_MARKS=${JSON.stringify(drainHydrateMarks(stream))};/*stream ${stream}*/</script>`;
};