import vm from 'vm';

import { CLIENT_SIDE_ONLY } from '../configuration/constants';

const parseMagicComments = (str: string): Record<string, any> => {
  if (str.trim() === CLIENT_SIDE_ONLY) {
    return {};
  }

  try {
    const values = vm.runInNewContext(`(function(){return {${str}};})()`);

    return values;
  } catch (e) {
    return {};
  }
};

export const commentsToConfiguration = (comments: any[]): Record<string, any> =>
  comments.reduce(
    (acc, comment) => ({
      ...acc,
      ...parseMagicComments(comment),
    }),
    {} as any
  );
