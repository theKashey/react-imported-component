import {relative, sep} from 'path';
import {readFile, writeFile} from 'fs';

try {
  require('babel-polyfill');
} catch (err) {
  try {
    require('@babel/polyfill');
  } catch (e) {
    throw Error('react-imported-component: scanImports is requiring babel-polyfill, or @babel/polyfill to work. Please add this dependency.')
  }
}

/* eslint-disable no-console */

export const promisify = (fn, context, noReject) => (...args) => new Promise((resolve, reject) => {
  fn.call(context, ...args, (error, ok) => {
    if (error) {
      if (noReject) {
        resolve(error);
      } else {
        reject(error);
      }
    }
    resolve(ok);
  });
});

export const normalizePath = path => path.split(sep).join('/');
export const getRelative = (from, to) => {
  if (/^[^./]/.test(to)) return to
  // force one unit paths
  const rel = normalizePath(relative(from, to));
  return (rel[0] !== '.')
    ? './' + rel
    : rel;
};

export const getMatchString = (pattern, selected) => str => (
  (str.match(new RegExp(pattern, 'g')) || [])
    .map(statement =>
      statement.match(new RegExp(pattern, 'i'))[selected]
    )
);


export const pReadFile = promisify(readFile);
export const pWriteFile = promisify(writeFile);
export const getFileContent = file => pReadFile(file, 'utf8');
