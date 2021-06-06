/* tslint:disable no-console */

import { scanTop } from './scanForImports';

if (!process.argv[3]) {
  console.log('usage: imported-components sourceRoot targetFile');
  console.log('example: imported-components src src/importedComponents.js');
} else {
  scanTop(process.cwd(), process.argv[2], process.argv[3]);
}
