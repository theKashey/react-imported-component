import React from 'react';
import {expect} from 'chai';

import {remapImports} from "../src/scanners/scanForImports";

describe('scanForImports', () => {
  it('should map simple import', () => {
    const imports = {};
    remapImports(
      [{file: 'a', content: 'blabla;import("./a.js"); blabla;'}],
      '.', '.',
      (a, b) => a + b,
      imports
    );
    console.log(imports);
  })

  it('should map simple import with a comment', () => {
    const imports = {};
    remapImports(
      [{file: 'a', content: 'blabla;import(/* comment:42 */"./a.js"); blabla;'}],
      '.', '.',
      (a, b) => a + b,
      imports
    );
    console.log(imports);
  })

  it('should map complex import', () => {
    const imports = {};
    remapImports(
      [{
        file: 'a',
        content: 'blabla;import(/* webpack: "123" */"./a.js"); blabla; import(/* webpack: 123 */ \'./b.js\');'
      }],
      '.', '.',
      (a, b) => a + b,
      imports
    );
    console.log(imports);
  })

  it('should remove webpackPrefetch and webpackPreload', () => {
    const imports = {};
    remapImports(
      [{
        file: 'a',
        content: 'blabla;import(/* webpackPrefetch: true *//* webpack: "123" */"./a.js"); blabla; import(/* webpackPreload: true */ \'./b.js\');'
      }],
      '.', '.',
      (a, b) => a + b,
      imports
    );
    console.log(imports);
  })


})