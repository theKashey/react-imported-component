import {remapImports} from "../src/scanners/scanForImports";
import {dirname} from "path";

describe('scanForImports', () => {
  const rel = '.' + dirname(__dirname);
  const root = '.';

  it('should map simple import', () => {
    const imports = {};
    remapImports(
      [{file: 'a', content: 'blabla;import("./a.js"); blabla;'}],
      root, root,
      (a, b) => a + b,
      imports
    );
    expect(Object.values(imports)).toEqual([
      `[() => import('${rel}/a.js'), '', '${rel}/a.js']`
    ]);
  });

  it('should map simple import with a comment', () => {
    const imports = {};
    remapImports(
      [{file: 'a', content: 'blabla;import(/* comment:42 */"./a.js"); blabla;'}],
      root, root,
      (a, b) => a + b,
      imports
    );
    expect(Object.values(imports)).toEqual([
      `[() => import(/* comment:42 */'${rel}/a.js'), '', '${rel}/a.js']`
    ]);
  });

  it('should map complex import', () => {
    const imports = {};
    remapImports(
      [{
        file: 'a',
        content: 'blabla;import(/* webpack: "123" */"./a.js"); blabla; import(/* webpack: 123 */ \'./b.js\');'
      }],
      root, root,
      (a, b) => a + b,
      imports
    );
    expect(Object.values(imports)).toEqual([
      `[() => import(/* webpack: \"123\" */'${rel}/a.js'), '', '${rel}/a.js']`,
      `[() => import(/* webpack: 123 */'${rel}/b.js'), '', '${rel}/b.js']`,
    ]);
  });

  it('should match chunk name', () => {
    const imports = {};
    remapImports(
      [{
        file: 'a',
        content: 'blabla;import(/* webpackChunkName: "chunk-a" */"./a.js"); blabla; import(/* webpack: 123 */ \'./b.js\');'
      }],
      root, root,
      (a, b) => a + b,
      imports
    );
    expect(Object.values(imports)).toEqual([
      `[() => import(/* webpackChunkName: "chunk-a" */'${rel}/a.js'), 'chunk-a', '${rel}/a.js']`,
      `[() => import(/* webpack: 123 */'${rel}/b.js'), '', '${rel}/b.js']`,
    ]);
  });

  it('should remove webpackPrefetch and webpackPreload', () => {
    const imports = {};
    remapImports(
      [{
        file: 'a',
        content: 'blabla;import(/* webpackPrefetch: true *//* webpack: "123" */"./a.js"); blabla; import(/* webpackPreload: true */ \'./b.js\');'
      }],
      root, root,
      (a, b) => a + b,
      imports
    );
    expect(Object.values(imports)).toEqual([
      `[() => import(/*  *//* webpack: \"123\" */'${rel}/a.js'), '', '${rel}/a.js']`,
      `[() => import(/*  */'${rel}/b.js'), '', '${rel}/b.js']`,
    ]);
  });
});