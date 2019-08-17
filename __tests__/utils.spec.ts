import {remapImports} from "../src/scanners/scanForImports";
import {dirname} from "path";

describe('scanForImports', () => {
  const rel = '.'+dirname(__dirname);

  it('should map simple import', () => {
    const imports = {};
    remapImports(
      [{file: 'a', content: 'blabla;import("./a.js"); blabla;'}],
      '.', '.',
      (a, b) => a + b,
      imports
    );
    expect(Object.values(imports)).toEqual([
      `() => import('${rel}/a.js')`
    ]);
  });

  it('should map simple import with a comment', () => {
    const imports = {};
    remapImports(
      [{file: 'a', content: 'blabla;import(/* comment:42 */"./a.js"); blabla;'}],
      '.', '.',
      (a, b) => a + b,
      imports
    );
    expect(Object.values(imports)).toEqual([
      `() => import(/* comment:42 */'${rel}/a.js')`
    ]);
  });

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
    expect(Object.values(imports)).toEqual([
      `() => import(/* webpack: \"123\" */'${rel}/a.js')`,
      `() => import(/* webpack: 123 */'${rel}/b.js')`,
    ]);
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
    expect(Object.values(imports)).toEqual([
      `() => import(/*  *//* webpack: \"123\" */'${rel}/a.js')`,
      `() => import(/*  */'${rel}/b.js')`,
    ]);
  });
});