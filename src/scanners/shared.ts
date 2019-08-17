import {relative, sep} from 'path';
import {readFile, writeFile} from 'fs';
import {promisify} from 'util';

// try {
//   require('babel-polyfill');
// } catch (err) {
//   try {
//     require('@babel/polyfill');
//   } catch (e) {
//     throw Error('react-imported-component: scanImports is requiring babel-polyfill, or @babel/polyfill to work. Please add this dependency.')
//   }
// }

/* eslint-disable no-console */

// export const promisify = (fn, context, noReject) => (...args) => new Promise((resolve, reject) => {
//   fn.call(context, ...args, (error, ok) => {
//     if (error) {
//       if (noReject) {
//         resolve(error);
//       } else {
//         reject(error);
//       }
//     }
//     resolve(ok);
//   });
// });

export const normalizePath = (path: string) => path.split(sep).join('/');
export const getRelative = (from: string, to: string) => {
  // force one unit paths
  const rel = normalizePath(relative(from, to));
  return (rel[0] !== '.')
    ? './' + rel
    : rel;
};

export const getMatchString = (pattern: string, selected: number) => (str: string) => (
  (str.match(new RegExp(pattern, 'g')) || [])
    .map(statement =>
      (statement.match(new RegExp(pattern, 'i')) || [])[selected]
    )
);


export const pReadFile = promisify(readFile);
export const pWriteFile = promisify(writeFile);
export const getFileContent = (file: string) => pReadFile(file, 'utf8');
