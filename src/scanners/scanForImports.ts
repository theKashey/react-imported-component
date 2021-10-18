/* tslint:disable no-console */

import { dirname, extname, resolve } from 'path';
// @ts-ignore
import scanDirectory from 'scan-directory';

import { existsSync, Stats } from 'fs';
import { ImportedConfiguration } from '../configuration/configuration';
import { CLIENT_SIDE_ONLY } from '../configuration/constants';
import { getFileContent, getMatchString, getRelative, normalizePath, pWriteFile } from './shared';

const RESOLVE_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx', '.mjs'];

const trimImport = (str: string) => str.replace(/['"]/g, '');

const getImportMatch = getMatchString(`(['"]?[\\w-/.@]+['"]?)\\)`, 1);
const getImports = (str: string) =>
  getImportMatch(
    str
      // remove comments
      .replace(/\/\*([^\*]*)\*\//gi, '')
      .replace(/\/\/(.*)/gi, '')
      // remove new lines
      .replace(/\n/gi, '')
      // remove spaces?
      .replace(/[\s]+\)/i, ')')
  );

const getComment = getMatchString(/\/\*.*\*\// as any, 0);

const getChunkName = getMatchString('webpackChunkName: "([^"]*)"', 1);

const clientSideOnly = (comment: string) => comment.indexOf(CLIENT_SIDE_ONLY) >= 0;

const clearComment = (str: string) => str.replace('webpackPrefetch: true', '').replace('webpackPreload: true', '');

interface MappedImport {
  name: string;
  comment: string;
}

interface FileContent {
  file: string;
  content: string;
}

const getImportString = (pattern: string, selected: number) => (str: string): MappedImport[] =>
  getMatchString(pattern, selected)(str).map(statement => {
    return {
      name: trimImport(getImports(statement + ')')[0] || ''),
      comment: clearComment(getComment(statement)[0] || ''),
    };
  });

export const getDynamicImports = getImportString(`import[\\s]?\\((([^)])+['"]?)\\)`, 1);

export const cleanFileContent = (content: string) => {
  const mapping: string[] = [];
  // wrap
  const wrapped = content.replace(new RegExp(`import[\\s]?\\((([^)])+['"]?)\\)`, 'g'), match => {
    const placement = mapping.push(match) - 1;
    return `imported_${placement}_replacement`;
  });

  const cleaned = wrapped.replace(new RegExp('//.*', 'g'), '').replace(new RegExp('\\/\\*[\\s\\S]*?\\*\\/', 'gm'), '');

  const unwrapped = cleaned.replace(new RegExp('imported_([\\d]*)_replacement', 'g'), (_, b: string) => {
    return mapping[+b];
  });

  return unwrapped;
};

const mapImports = (file: string, imports: MappedImport[]) =>
  imports.map(dep => {
    const { name } = dep;
    if (name && name.charAt(0) === '.') {
      return {
        ...dep,
        file,
        name: resolve(dirname(file), name),
        doNotTransform: false,
      };
    }
    return {
      ...dep,
      file,
      doNotTransform: true,
    };
  });

const rejectSystemFiles = (test: Required<ImportedConfiguration>['testFolder']) => (file: string, stats: Stats) => {
  if (stats.isDirectory()) {
    return !test(file);
  }
  return false;
};

const rejectNodeModulesAndDotFolders = (file: string) => !(file.match(/node_modules/) || file.match(/(\/\.\w+)/));

export const remapImports = (
  data: FileContent[],
  root: string,
  targetDir: string,
  getRelativeName: (a: string, b: string) => string,
  imports: Record<string, string>,
  testImport: NonNullable<ImportedConfiguration['testImport']>,
  chunkName?: ImportedConfiguration['chunkName']
) =>
  data
    .map(({ file, content }) => mapImports(file, getDynamicImports(cleanFileContent(content))))
    .forEach(importBlock =>
      importBlock.forEach(({ name, comment, doNotTransform, file }) => {
        const rootName = doNotTransform ? name : getRelativeName(root, name);
        const fileName = doNotTransform ? name : getRelativeName(targetDir, name);
        const sourceName = getRelativeName(root, file);
        if (testImport(rootName, sourceName)) {
          const isClientSideOnly = clientSideOnly(comment);
          const givenChunkName = getChunkName(comment)[0] || '';
          const def = `[() => import(${comment}'${fileName}'), '${(chunkName &&
            chunkName(rootName, sourceName, { chunkName: givenChunkName })) ||
            givenChunkName}', '${rootName}', ${isClientSideOnly}] /* from ${sourceName} */`;
          const slot = getRelativeName(root, name);

          // keep the maximal definition
          imports[slot] = !imports[slot] ? def : imports[slot].length > def.length ? imports[slot] : def;
        }
      })
    );

export function scanTop(root: string, start: string, target: string) {
  async function scan() {
    const sourceDir = resolve(root, start);
    console.log('scanning', sourceDir, 'for imports...');

    // try load configuration
    const configurationFile = resolve(root, '.imported.js');
    const {
      testFolder = rejectNodeModulesAndDotFolders,
      testFile = () => true,
      testImport = () => true,
      chunkName,
      configuration,
    }: ImportedConfiguration = existsSync(configurationFile) ? require(configurationFile) : {};

    const files = ((await scanDirectory(sourceDir, undefined, rejectSystemFiles(testFolder))) as string[])
      .filter(name => normalizePath(name).indexOf(target) === -1)
      .filter(name => RESOLVE_EXTENSIONS.indexOf(extname(name)) >= 0)
      .filter(name => testFile(name))
      .sort();

    const data: FileContent[] = await Promise.all(
      files.map(async file => {
        const content = await getFileContent(file);
        return {
          file,
          content,
        };
      })
    );

    const imports: Record<string, string> = {};
    const targetDir = resolve(root, dirname(target));
    remapImports(data, root, targetDir, getRelative, imports, testImport, chunkName);

    console.log(`${Object.keys(imports).length} imports found, saving to ${target}`);

    pWriteFile(
      target,
      `
    /* eslint-disable */
    /* tslint:disable */
    
    // generated by react-imported-component, DO NOT EDIT     
    import {assignImportedComponents} from 'react-imported-component/macro';
    ${configuration &&
      `import {setConfiguration} from 'react-imported-component/boot';
// as configured in .imported.js
setConfiguration(${JSON.stringify(configuration, null, 2)});
    `}    
    
    // all your imports are defined here
    // all, even the ones you tried to hide in comments (that's the cost of making a very fast parser)
    // to remove any import from here
    // 1) use magic comment \`import(/* client-side */ './myFile')\` - and it will disappear
    // 2) use file filter to ignore specific locations (refer to the README - https://github.com/theKashey/react-imported-component/#server-side-auto-import)
    // 3) use .imported.js to control this table generation (refer to the README - https://github.com/theKashey/react-imported-component/#-imported-js)
    
    const applicationImports = assignImportedComponents([
${Object.keys(imports)
  .map(key => `      ${imports[key]},`)
  .sort()
  .join('\n')}
    ]);
    
    export default applicationImports;
    
    // @ts-ignore
    if (module.hot) {
       // these imports would make this module a parent for the imported modules.
       // but this is just a helper - so ignore(and accept!) all updates
       
       // @ts-ignore
       module.hot.accept(() => null);
    }    
    `
    );
  }

  return scan();
}
