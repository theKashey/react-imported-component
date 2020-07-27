import vm from 'vm';
import { CLIENT_SIDE_ONLY } from '../configuration/constants';

const parseMagicComments = (str: string): object => {
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

export const commentsToConfiguration = (comments: any[]) =>
  comments.reduce(
    (acc, comment) => ({
      ...acc,
      ...parseMagicComments(comment),
    }),
    {} as any
  );
