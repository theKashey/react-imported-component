export type Preloader = () => any;

let preloaders: Preloader[] = [];
type Callback = () => void;

/**
 * adds a precondition before resolving any imported object
 */
export const addPreloader = (preloader: Preloader): Callback => {
  preloaders.push(preloader);

  return () => {
    preloaders = preloaders.filter((p) => p !== preloader);
  };
};

export const getPreloaders = (): any[] => preloaders.map((preloader) => preloader());
