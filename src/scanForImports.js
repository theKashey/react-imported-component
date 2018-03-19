import 'babel-polyfill';
import scanDirectory from 'scan-directory';
import {extname, resolve, relative, dirname, join, sep} from 'path';
import {readFile, writeFile} from 'fs';
import {encipherImport} from './utils';

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

const getRelative = (from, to) => {
  const rel = relative(from, to);
  if (rel[0] !== '.') {
    return '.' + sep + rel;
  }
  return rel;
};

const pReadFile = promisify(readFile);
const pWriteFile = promisify(writeFile);


const trimImport = str => str.replace(/['"]/g, '');
export const getFileContent = file => pReadFile(file, 'utf8');

const getImportString = (pattern, selected) => str => (
  (str.match(new RegExp(pattern, 'g')) || [])
    .map(statement => trimImport(statement.match(new RegExp(pattern, 'i'))[selected]))
);

const getDynamicImports = getImportString(`import\\((['"]?[\\w-/.]+['"]?)\\)`, 1);

const mapImports = (file, imports) => imports.map(dep => {
  if (dep && dep.charAt(0) === '.') {
    return resolve(dirname(file), dep)
  }
  return dep;
});

const rejectSystem = (file, stats) => stats.isDirectory() && file.match(/node_modules/) || file.match(/(\/\.\w+)/)

function scanTop(root, start, target) {

  async function scan() {
    console.log('scanning', start, 'for imports...')

    const files =
      (await scanDirectory(join(root, start), undefined, rejectSystem))
        .filter(name => name.indexOf(target) === -1)
        .filter(name => ['.js', '.jsx', '.ts', '.tsx'].indexOf(extname(name)) >= 0)

    const data = await Promise.all(
      files
        .map(async function (file) {
          const content = await getFileContent(file);
          return {
            file,
            content
          }
        })
    );

    const imports = {};
    const targetDir = resolve(root, dirname(target));
    data
      .map(({file, content}) => mapImports(file, getDynamicImports(content)))
      .forEach(importBlock => importBlock.forEach(name => {
        imports[getRelative(root, name)] = `() => import('${getRelative(targetDir, name)}')`
      }));

    console.log(`${Object.keys(imports).length} imports found, saving to ${target}`);

    pWriteFile(target, `/* eslint-disable */ 
    import {assignImportedComponents} from 'react-imported-component';
    const applicationImports = {
      ${
      Object
        .keys(imports)
        .map((key,index) => `${index}: ${imports[key]},`)
        .join('\n')
      }
    };
    assignImportedComponents(applicationImports);
    export default applicationImports;`)
  }

  return scan();
}


if(!process.argv[3]){
  console.log('usage: imported-components sourceRoot targetFile');
  console.log('example: imported-components src src/importedComponents');
} else {
  scanTop(process.cwd(), process.argv[2], process.argv[3]);
}
