import {rehydrateMarks} from "../marks";

export const injectLoadableTracker = (name) => {
  const value = global[name];
  if (value) {
    if (value.forEach) {
      console.log('given: ', value);
      throw new Error(`injectLoadableTracker(${name}) expected to be expected on Array-like variable, and only once.`)
    }
    value.forEach(rehydrateMarks);
  }
  global[name] = {
    push: rehydrateMarks
  }
};

export const getLoadableTrackerCallback = (name) => (marks) => `<script>${name}.push(${JSON.stringify(marks)});</script>`;