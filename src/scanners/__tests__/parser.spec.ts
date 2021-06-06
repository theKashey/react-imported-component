import { dirname } from 'path';
import { remapImports } from '../scanForImports';
import { getRelative } from '../shared';

describe('scanForImports', () => {
  const rel = dirname(__dirname);
  const root = '.';
  const rootRel = '.' + process.cwd();
  const sourceFile = `${rel}/a`;

  it('should map simple import', () => {
    const imports = {};
    remapImports(
      [{ file: `${rel}/a`, content: 'blabla;import("./b.js"); blabla;' }],
      rel,
      rel,
      getRelative,
      imports,
      () => true
    );
    expect(Object.values(imports)).toEqual([`[() => import('./b.js'), '', './b.js', false] /* from ./a */`]);
  });

  it('handles imports in jsdoc', () => {
    const imports = {};
    remapImports(
      [
        {
          file: sourceFile,
          content: `
      /**
       * @type {import('wrong-import')}
       */
      import(/* comment:valuable */ "./a.js");
      import("./b.js");
      // import('another-wrong-import');// FIXME: temporary removed
      `,
        },
      ],
      rel,
      rel,
      getRelative,
      imports,
      () => true
    );
    expect(Object.values(imports)).toEqual([
      `[() => import(/* comment:valuable */'./a.js'), '', './a.js', false] /* from ./a */`,
      `[() => import('./b.js'), '', './b.js', false] /* from ./a */`,
    ]);
  });

  it('should map client-side import', () => {
    const imports = {};
    remapImports(
      [{ file: sourceFile, content: 'blabla;import(/* client-side */"./a.js"); blabla;' }],
      rel,
      rel,
      getRelative,
      imports,
      () => true
    );
    expect(Object.values(imports)).toEqual([
      `[() => import(/* client-side */'./a.js'), '', './a.js', true] /* from ./a */`,
    ]);
  });

  it('should map simple import with a comment', () => {
    const imports = {};
    remapImports(
      [{ file: sourceFile, content: 'blabla;import(/* comment:42 */"./a.js"); blabla;' }],
      rel,
      rel,
      getRelative,
      imports,
      () => true
    );
    expect(Object.values(imports)).toEqual([
      `[() => import(/* comment:42 */'./a.js'), '', './a.js', false] /* from ./a */`,
    ]);
  });

  it('should map complex import', () => {
    const imports = {};
    remapImports(
      [
        {
          file: sourceFile,
          content: 'blabla;import(/* webpack: "123" */"./a.js"); blabla; import(/* webpack: 123 */ \'./b.js\');',
        },
      ],
      rel,
      rel,
      getRelative,
      imports,
      () => true
    );
    expect(Object.values(imports)).toEqual([
      `[() => import(/* webpack: \"123\" */'./a.js'), '', './a.js', false] /* from ./a */`,
      `[() => import(/* webpack: 123 */'./b.js'), '', './b.js', false] /* from ./a */`,
    ]);
  });

  it('should match chunk name', () => {
    const imports = {};
    remapImports(
      [
        {
          file: 'a',
          content:
            'blabla;import(/* webpackChunkName: "chunk-a" */"./a.js"); blabla; import(/* webpack: 123 */ \'./b.js\');',
        },
      ],
      root,
      root,
      (a, b) => a + b,
      imports,
      () => true
    );
    expect(Object.values(imports)).toEqual([
      `[() => import(/* webpackChunkName: "chunk-a" */'${rootRel}/a.js'), 'chunk-a', '${rootRel}/a.js', false] /* from .a */`,
      `[() => import(/* webpack: 123 */'${rootRel}/b.js'), '', '${rootRel}/b.js', false] /* from .a */`,
    ]);
  });

  it('should override chunk name', () => {
    const imports = {};
    remapImports(
      [
        {
          file: 'a',
          content:
            'blabla;import(/* webpackChunkName: "chunk-a" */"./a.js"); blabla; import(/* webpackChunkName: "chunk-b" */"./b.js"); import(/* webpackChunkName: "chunk-c" */"./c.js");',
        },
      ],
      root,
      root,
      (a, b) => a + b,
      imports,
      imported => imported.indexOf('c.js') < 0,
      (imported, _, options) => (imported.indexOf('a.js') > 0 ? `test-${options.chunkName}-test` : 'bundle-b')
    );
    expect(Object.values(imports)).toEqual([
      `[() => import(/* webpackChunkName: \"chunk-a\" */'${rootRel}/a.js'), 'test-chunk-a-test', '${rootRel}/a.js', false] /* from .a */`,
      `[() => import(/* webpackChunkName: \"chunk-b\" */'${rootRel}/b.js'), 'bundle-b', '${rootRel}/b.js', false] /* from .a */`,
    ]);
  });

  it('should match support multiline imports', () => {
    const imports = {};
    remapImports(
      [
        {
          file: 'a',
          content: `
            blabla;import(
            /* webpackChunkName: "chunk-a" */
            "./a.js"
            );
            something else
            import(
             // ts-ignore
             "./b.js"
            );
            `,
        },
      ],
      root,
      root,
      (a, b) => a + b,
      imports,
      () => true
    );
    expect(Object.values(imports)).toEqual([
      `[() => import(/* webpackChunkName: \"chunk-a\" */'${rootRel}/a.js'), 'chunk-a', '${rootRel}/a.js', false] /* from .a */`,
      `[() => import('${rootRel}/b.js'), '', '${rootRel}/b.js', false] /* from .a */`,
    ]);
  });

  it('should remove webpackPrefetch and webpackPreload', () => {
    const imports = {};
    remapImports(
      [
        {
          file: 'a',
          content:
            'blabla;import(/* webpackPrefetch: true *//* webpack: "123" */"./a.js"); blabla; import(/* webpackPreload: true */ \'./b.js\');',
        },
      ],
      root,
      root,
      (a, b) => a + b,
      imports,
      () => true
    );
    expect(Object.values(imports)).toEqual([
      `[() => import(/*  *//* webpack: \"123\" */'${rootRel}/a.js'), '', '${rootRel}/a.js', false] /* from .a */`,
      `[() => import(/*  */'${rootRel}/b.js'), '', '${rootRel}/b.js', false] /* from .a */`,
    ]);
  });
});
