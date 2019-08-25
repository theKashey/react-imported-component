import {isBackend} from "./detectBackend";

export const settings = {
  hot: (!!module as any).hot,
  SSR: isBackend
};

export const setConfiguration = (config: Partial<typeof settings>) => {
  Object.assign(settings, config);
};