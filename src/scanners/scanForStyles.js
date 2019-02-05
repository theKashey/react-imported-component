/*eslint no-console: "warn",  no-useless-escape: "warn"*/

import scanDirectory from 'scan-directory';
import {extname, join, relative} from 'path';
import {getFileContent, normalizePath, pWriteFile} from "./shared";

const RESOLVE_EXTENSIONS = ['.css'];

const mapStyles = (styles) => (
  (
    styles
    // remove style body
      .replace(/({[^{}]+})/g, '$')
      .replace(/({[^{}]+})/g, '$')
      // match style name
      .match(/\.([^>~.,$:{\[\s]+)?/g) || []
    //.match(/\.([^>~.,$;:\s]+)[>~.,$;:\s]/g) || []
  )
  // clean style name
    .map(x => x.replace(/[\s,.>~$]+/, ''))
    .map(x => x.replace(/[.\s.:]+/, ''))
);

export const remapStyles = (data, result) => (
  data
    .map(({file, content}) => ({file, styles: mapStyles(content)}))
    .forEach(({file, styles}) => (
      styles.forEach(className => {
        if (!result[className]) {
          result[className] = {};
        }
        result[className][file] = true;
      }))
    )
);

const toFlattenArray = (styles) => (
  Object
    .keys(styles)
    .reduce((acc, style) => {
      acc[style] = Object.keys(styles[style]);
      return acc;
    }, {})
);

function scanTop(root, start, target) {

  async function scan() {
    const rootDir = join(root, start);
    console.log('scanning', start, 'for styles');

    const files =
      (await scanDirectory(rootDir, undefined, () => false))
        .filter(name => normalizePath(name).indexOf(target) === -1)
        .filter(name => RESOLVE_EXTENSIONS.indexOf(extname(name)) >= 0)

    const data = await Promise.all(
      files
        .map(async function (file) {
          const content = await getFileContent(file);
          return {
            file: relative(rootDir, file),
            content
          }
        })
    );

    const styles = {};
    remapStyles(data, styles);

    console.log(`${Object.keys(styles).length} styles in ${files.length} files found, saving to ${target}`);

    pWriteFile(target, `
    /* eslint-disable */
    /* tslint:disable */
        
    const applicationStyles = ${JSON.stringify(toFlattenArray(styles), null, ' ')};
      
    export default applicationStyles;`)
  }

  return scan();
}


if (!process.argv[3]) {
  console.log('usage: imported-components-css distRoot targetFile');
  console.log('example: imported-components-css build src/importedComponentsCss.js');
} else {
  scanTop(process.cwd(), process.argv[2], process.argv[3]);
}
