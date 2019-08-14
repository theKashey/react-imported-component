import isBackend from "./detectBackend";

export const settings = {
  hot: !!module.hot,
  SSR: isBackend
};

export const setConfiguration = (config) => Object.assign(settings, config);