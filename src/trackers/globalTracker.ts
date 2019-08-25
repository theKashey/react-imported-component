import {rehydrateMarks} from "../marks";

export const injectLoadableTracker = (name: string = "importedComponents") => {
  const value = (global as any)[name] as Array<string[]>;
  if (value) {
    if (!value.push || (value.push && !value.forEach)) {
      console.error('given: ', value);
      throw new Error(`injectLoadableTracker(${name}) expected to be expected on Array-like variable, and only once.`)
    }
    value.forEach(mark => rehydrateMarks(mark));
  }
  (global as any)[name] = {
    push: rehydrateMarks
  }
};

export const getLoadableTrackerCallback = (name: string = "importedComponents") => (
  (marks: string[]) => (
    `<script>window.${name}=window.${name} || [];${name}.push(${JSON.stringify(marks)});</script>`
  )
);