import { readFile, writeFile } from 'fs';
import { relative, sep } from 'path';
import { promisify } from 'util';

export const normalizePath = (path: string) => path.split(sep).join('/');
export const getRelative = (from: string, to: string) => {
  // force one unit paths
  const rel = normalizePath(relative(from, to));
  return rel[0] !== '.' ? './' + rel : rel;
};

export const getMatchString = (pattern: string, selected: number) => (str: string) =>
  (str.match(new RegExp(pattern, 'g')) || []).map(
    statement => (statement.match(new RegExp(pattern, 'i')) || [])[selected]
  );

export const pReadFile = promisify(readFile);
export const pWriteFile = promisify(writeFile);
export const getFileContent = (file: string) => pReadFile(file, 'utf8');
