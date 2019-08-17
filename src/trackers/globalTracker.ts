import {rehydrateMarks} from "../marks";

export const injectLoadableTracker = (name: string) => {
  const value = (global as any)[name] as Array<string>;
  if (value) {
    if (value.forEach) {
      console.error('given: ', value);
      throw new Error(`injectLoadableTracker(${name}) expected to be expected on Array-like variable, and only once.`)
    }
    rehydrateMarks(value);
  }
  (global as any)[name] = {
    push: rehydrateMarks
  }
};

export const getLoadableTrackerCallback = (name: string) => (
  (marks: string[]) => (
    `<script>${name}.push(${JSON.stringify(marks)});</script>`
  )
);