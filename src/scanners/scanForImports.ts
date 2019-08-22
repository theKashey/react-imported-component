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

const clearComment = (str:string) => (
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
      const {name, comment} = dep;
      if (name && name.charAt(0) === '.') {
        return {
          name: resolve(dirname(file), name),
          comment
        }
      }
      return dep;
    })
);

const rejectSystemFiles = (file: string, stats: Stats) => (
  stats.isDirectory() && file.match(/node_modules/) || file.match(/(\/\.\w+)/)
);

export const remapImports = (data: FileContent[], root: string, targetDir: string, getRelative: (a: string, b: string) => string, imports: Record<string, string>) => (
  data
    .map(({file, content}) => mapImports(file, getDynamicImports(content)))
    .forEach(importBlock => importBlock.forEach(({name, comment}) => {
      imports[getRelative(root, name)] = `() => import(${comment}'${getRelative(targetDir, name)}')`
    }))
);

function scanTop(root: string, start: string, target: string) {

  async function scan() {
    console.log('scanning', start, 'for imports...');

    const files =
      (await scanDirectory(join(root, start), undefined, rejectSystemFiles) as string[])
        .filter(name => normalizePath(name).indexOf(target) === -1)
        .filter(name => RESOLVE_EXTENSIONS.indexOf(extname(name)) >= 0)

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
    export default applicationImports;`)
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
