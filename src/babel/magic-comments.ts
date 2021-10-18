import { ImportedConfiguration, KnownImportOptions } from '../configuration/configuration';
import { commentsToConfiguration } from './utils';

const preservePrefetch = (_: any, __: any, options: KnownImportOptions) => !!options.webpackPrefetch;
const preservePreload = (_: any, __: any, options: KnownImportOptions) => !!options.webpackPreload;
const preserveChunkName = (_: any, __: any, options: KnownImportOptions) =>
  options.webpackChunkName || options.chunkName;

const chunkComment = (chunk: string) => `webpackChunkName: "${chunk}"`;
const preloadComment = () => `webpackPreload: true`;
const prefetchComment = () => `webpackPrefetch: true`;

const knownMagics = ['webpackChunkName', 'webpackPrefetch', 'webpackPreload'];

const toComments = <T extends Record<string, any>>(conf: T): string[] =>
  (Object.keys(conf) as Array<keyof T>)
    .filter((key) => !knownMagics.includes(key as any))
    .reduce((acc, key) => {
      acc.concat(`${key}:${JSON.stringify(conf[key])}`);

      return acc;
    }, [] as string[]);

const nullish = <T>(a: T, b: T): T => {
  if (a === undefined) {
    return b;
  }

  return a;
};

export const processComment = (
  configuration: ImportedConfiguration,
  comments: string[],
  importName: string,
  fileName: string,
  options: {
    isBootstrapFile: boolean;
  }
): string[] => {
  const {
    shouldPrefetch = preservePrefetch,
    shouldPreload = preservePreload,
    chunkName = preserveChunkName,
  } = configuration;

  const importConfiguration = commentsToConfiguration(comments);

  const newChunkName = nullish(
    chunkName(importName, fileName, importConfiguration),
    preserveChunkName(importName, fileName, importConfiguration)
  );
  const { isBootstrapFile } = options;

  return [
    ...toComments(importConfiguration),
    !isBootstrapFile && shouldPrefetch(importName, fileName, importConfiguration) ? prefetchComment() : '',
    !isBootstrapFile && shouldPreload(importName, fileName, importConfiguration) ? preloadComment() : '',
    newChunkName ? chunkComment(newChunkName) : '',
  ].filter((x) => !!x);
};
