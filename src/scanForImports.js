import scanDirectory from 'scan-directory';
import {extname, resolve, relative, dirname, join, sep} from 'path';
import {readFile, writeFile} from 'fs';

try {
  require('babel-polyfill');
} catch (err) {
  require('@babel/polyfill');
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

const getMatchString = (pattern, selected) => str => (
  (str.match(new RegExp(pattern, 'g')) || [])
    .map(statement =>
      statement.match(new RegExp(pattern, 'i'))[selected]
    )
);

const getImports = getMatchString(`(['"]?[\\w-/.]+['"]?)\\)`, 1);
const getComment = getMatchString(/\/\*.*\*\//, 0);

const clearComment = str => (
  str
    .replace("webpackPrefetch: true", '')
    .replace("webpackPreload: true", '')
);

const getImportString = (pattern, selected) => str => (
  getMatchString(pattern, selected)(str)
    .map(statement => {
      return {
        name: trimImport(getImports(statement + ')')[0] || ''),
        comment: clearComment(getComment(statement)[0] || ''),
      }
    })
);

export const getDynamicImports = getImportString(`import\\((([^)])+['"]?)\\)`, 1);

const mapImports = (file, imports) => imports.map(dep => {
  const {name, comment} = dep;
  if (name && name.charAt(0) === '.') {
    return {
      name: resolve(dirname(file), name),
      comment
    }
  }
  return dep;
});

const rejectSystem = (file, stats) => stats.isDirectory() && file.match(/node_modules/) || file.match(/(\/\.\w+)/)

export const remapImports = (data, root, targetDir, getRelative, imports) => (
  data
    .map(({file, content}) => mapImports(file, getDynamicImports(content)))
    .forEach(importBlock => importBlock.forEach(({name, comment}) => {
      imports[getRelative(root, name)] = `() => import(${comment}'${getRelative(targetDir, name)}')`
    }))
);

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
    remapImports(data, root, targetDir, getRelative, imports);

    console.log(`${Object.keys(imports).length} imports found, saving to ${target}`);

    pWriteFile(target, `/* eslint-disable */ 
    import {assignImportedComponents} from 'react-imported-component';
    const applicationImports = {
      ${
      Object
        .keys(imports)
        .map((key, index) => `${index}: ${imports[key]},`)
        .join('\n')
      }
    };
    assignImportedComponents(applicationImports);
    export default applicationImports;`)
  }

  return scan();
}


if (!process.argv[3]) {
  console.log('usage: imported-components sourceRoot targetFile');
  console.log('example: imported-components src src/importedComponents');
} else {
  scanTop(process.cwd(), process.argv[2], process.argv[3]);
}
