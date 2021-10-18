import {rehydrateMarks} from '../loadable/marks';

/**
 * injects a loadable tracker on a given global variable name.
 *
 * WARNING: mutates the origin variable!
 *
 * @param name = 'importedComponents`
 * @example
 * ```js
 * window.importedMarks = window.importedMarks || [];
 * importedMarks.push(hydratedMarks[0]);
 * ///
 * injectLoadableTracker();
 */
export const injectLoadableTracker = (name: string = 'importedComponents') => {
  const value = (global as any)[name] as string[][];
  if (value) {
    if (!value.push || (Boolean(value.push) && !Boolean(value.forEach))) {
      // tslint:disable-next-line:no-console
      console.error('given: ', value);
      throw new Error(`injectLoadableTracker(${name}) expected to be expected on Array-like variable, and only once.`);
    }
    value.forEach(mark => rehydrateMarks(mark));
  }
  (global as any)[name] = {
    push: rehydrateMarks,
  };
};

export const getLoadableTrackerCallback = (name: string = 'importedComponents') => (marks: string[]) =>
  `<script>window.${name}=window.${name} || [];${name}.push(${JSON.stringify(marks)});</script>`;
