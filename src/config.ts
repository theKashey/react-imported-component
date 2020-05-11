import { isBackend } from './utils/detectBackend';

const rejectNetwork = (url: string) => url.indexOf('http') !== 0;

export const settings = {
  hot: (!!module as any).hot,
  SSR: isBackend,
  rethrowErrors: process.env.NODE_ENV !== 'production',
  fileFilter: rejectNetwork,
};

export const setConfiguration = (config: Partial<typeof settings>) => {
  Object.assign(settings, config);
};
