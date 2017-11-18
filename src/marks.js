let LOADABLE_MARKS = {};
let USED_MARKS = {};

export const useMark = (a) => {
  if (a) {
    USED_MARKS[a] = true;
  }
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

export const drainHydrateMarks = () => {
  const used = Object.keys(USED_MARKS);
  USED_MARKS = {};
  return used;
};

export const printDrainHydrateMarks = () => {
  return `<script>window.___REACT_DEFERRED_COMPONENT_MARKS=${JSON.stringify(drainHydrateMarks())}</script>`;
};

export default LOADABLE_MARKS;