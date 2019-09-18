const pluginTester = require("babel-plugin-tester");
const plugin = require("babel-plugin-macros");
const prettier = require("prettier");

describe('babel macro', () => {
  pluginTester({
    plugin,
    snapshot: true,
    babelOptions: {
      filename: __filename,
      plugins: ['dynamic-import-node'],
    },
    formatResult(result: string) {
      return prettier.format(result, {trailingComma: "es5"});
    },
    tests: {
      "nothing": "const a = 42;",
      "no usage": `import {lazy} from "../macro";`,
      "lazy": `
        import {lazy} from "../macro";
        const v = lazy(() => import('./a'));
        `,
      "many": `
        import {imported, useImported} from "../macro";        
        const v = imported(() => import('./a'));
        const x = () => useImported(() => import('./b'));
        `,
    },
  });
});