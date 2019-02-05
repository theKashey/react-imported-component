/*eslint no-console: "warn"*/

import scanDirectory from 'scan-directory';
import {extname, resolve, dirname, join} from 'path';
import {getFileContent, getMatchString, pWriteFile, normalizePath, getRelative} from "./shared";

const RESOLVE_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx', '.mjs'];

const trimImport = str => str.replace(/['"]/g, '');

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

export const getDynamicImports = getImportString(`import[\\s]?\\((([^)])+['"]?)\\)`, 1);

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
        .filter(name => normalizePath(name).indexOf(target) === -1)
        .filter(name => RESOLVE_EXTENSIONS.indexOf(extname(name)) >= 0)

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

    pWriteFile(target, `
    /* eslint-disable */
    /* tslint:disable */
     
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
  console.log('example: imported-components src src/importedComponents.js');
} else {
  scanTop(process.cwd(), process.argv[2], process.argv[3]);
}
