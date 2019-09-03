/*eslint no-console: "warn"*/

// @ts-ignore
import scanDirectory from 'scan-directory';
import {extname, resolve, dirname, join} from 'path';

import {getFileContent, getMatchString, pWriteFile, normalizePath, getRelative} from "./shared";
import {Stats} from "fs";

const RESOLVE_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx', '.mjs'];

const trimImport = (str: string) => str.replace(/['"]/g, '');

const getImports = getMatchString(`(['"]?[\\w-/.]+['"]?)\\)`, 1);
const getComment = getMatchString(/\/\*.*\*\// as any, 0);

const getChunkName = getMatchString('webpackChunkName: "([^"]*)"', 1);

const clearComment = (str: string) => (
  str
    .replace("webpackPrefetch: true", '')
    .replace("webpackPreload: true", '')
);

interface MappedImport {
  name: string;
  comment: string;
}

interface FileContent {
  file: string;
  content: string;
}

const getImportString = (pattern: string, selected: number) => (str: string): MappedImport[] => (
  getMatchString(pattern, selected)(str)
    .map(statement => {
      return {
        name: trimImport(getImports(statement + ')')[0] || ''),
        comment: clearComment(getComment(statement)[0] || ''),
      }
    })
);

export const getDynamicImports = getImportString(`import[\\s]?\\((([^)])+['"]?)\\)`, 1);

const mapImports = (file: string, imports: MappedImport[]) => (
  imports
    .map(dep => {
      const {name} = dep;
      if (name && name.charAt(0) === '.') {
        return {
          ...dep,
          name: resolve(dirname(file), name),
          doNotTransform: false,
        }
      }
      return {
        ...dep,
        doNotTransform: true,
      };
    })
);

const rejectSystemFiles = (file: string, stats: Stats) => (
  stats.isDirectory() && file.match(/node_modules/) || file.match(/(\/\.\w+)/)
);

export const remapImports = (
  data: FileContent[],
  root: string,
  targetDir: string,
  getRelative: (a: string, b: string) => string,
  imports: Record<string, string>,
) => (
  data
    .map(({file, content}) => mapImports(file, getDynamicImports(content)))
    .forEach(importBlock => (
      importBlock
        .forEach(({name, comment, doNotTransform}) => {
          const rootName = doNotTransform ? name : getRelative(root, name);
          const fileName = doNotTransform ? name : getRelative(targetDir, name);
          const def = `[() => import(${comment}'${fileName}'), '${getChunkName(comment)}', '${rootName}']`;
          const slot = getRelative(root, name);

          // keep the maximal definition
          imports[slot] = !imports[slot] ? def : (imports[slot].length > def.length ? imports[slot] : def);
        })
    ))
);

function scanTop(root: string, start: string, target: string) {

  async function scan() {
    console.log('scanning', start, 'for imports...');

    const files =
      (await scanDirectory(join(root, start), undefined, rejectSystemFiles) as string[])
        .filter(name => normalizePath(name).indexOf(target) === -1)
        .filter(name => RESOLVE_EXTENSIONS.indexOf(extname(name)) >= 0)
        .sort();

    const data: FileContent[] = await Promise.all(
      files
        .map(async function (file) {
          const content = await getFileContent(file);
          return {
            file,
            content
          }
        })
    );

    const imports: Record<string, string> = {};
    const targetDir = resolve(root, dirname(target));
    remapImports(data, root, targetDir, getRelative, imports);

    console.log(`${Object.keys(imports).length} imports found, saving to ${target}`);

    pWriteFile(target, `
    /* eslint-disable */
    /* tslint:disable */
     
    import {assignImportedComponents} from 'react-imported-component/boot';
    
    const applicationImports = [
${
      Object
        .keys(imports)
        .map(key => `      ${imports[key]},`)
        .sort()
        .join('\n')
      }
    ];
    
    assignImportedComponents(applicationImports);
    export default applicationImports;
    
    // @ts-ignore
    if (module.hot) {
       // these imports would make this module a parent for the imported modules.
       // but this is just a helper - so ignore(and accept!) all updates
       module.hot.accept(() => null);
    }    
    `)
  }

  return scan();
}


// --------


if (!process.argv[3]) {
  console.log('usage: imported-components sourceRoot targetFile');
  console.log('example: imported-components src src/importedComponents.js');
} else {
  scanTop(process.cwd(), process.argv[2], process.argv[3]);
}