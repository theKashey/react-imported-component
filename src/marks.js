let LOADABLE_MARKS = {};
let USED_MARKS = {};

export const useMark = (stream, marks) => {
  if (marks && marks.length) {
    if (!USED_MARKS[stream]) {
      USED_MARKS[stream] = {};
    }
    marks.forEach(a => USED_MARKS[stream][a] = true);
  }
};

export const drainHydrateMarks = (stream = 0) => {
  const used = Object.keys(USED_MARKS[stream] || {});
  delete USED_MARKS[stream];
  return used;
};

export const rehydrateMarks = (marks = false) => {
  const rehydrate = marks || global.___REACT_DEFERRED_COMPONENT_MARKS || [];
  return Promise.all(
    rehydrate
      .map(mark => LOADABLE_MARKS[mark])
      .filter(it => !!it)
      .map(loadable => loadable.load())
  );
};

export const printDrainHydrateMarks = (stream = 0) => {
  return `<script>window.___REACT_DEFERRED_COMPONENT_MARKS=${JSON.stringify(drainHydrateMarks(stream))}</script>`;
};

export default LOADABLE_MARKS;