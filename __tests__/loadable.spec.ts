import {getLoadable, importMatch} from "../src/loadable";

describe('getLoadable', () => {
  const importedWrapper = (_: any, b: any) => b;

  it('cache test - should use mark', () => {
    const l1 = getLoadable(() => importedWrapper('imported_mark1_component', Promise.resolve(42)));
    const l2 = getLoadable(() => importedWrapper('imported_mark1_component', Promise.resolve(42)));

    expect(l1).toEqual(l2)
  });

  it('cache test - no mark present', () => {
    const l1 = getLoadable(() => Promise.resolve(42));
    const l2 = getLoadable(() => Promise.resolve(42));

    expect(l1).not.toEqual(l2)
  });
});

describe('importMatch', () => {
  it('standard', () => {
    expect(
      importMatch(`() => importedWrapper('imported_mark1_component', Promise.resolve(TargetComponent)), true)`)
    ).toEqual(['mark1']);
  });

  it('webpack', () => {
    expect(
      importMatch(`() => importedWrapper('imported_mark1_component', __webpack_require__.e(/*! import() */ 0).then(__webpack_require__.bind(null, /*! ./components/Another */ "./app/components/Another.tsx")))`)
    ).toEqual(['mark1']);
  });

  it('webpack-prod', () => {
    expect(
      importMatch(`() => importedWrapper('imported_mark1_component',__webpack_require__.e(/*! import() */ 0).then(__webpack_require__.bind(null, /*! ./components/Another */ "./app/components/Another.tsx")))`)
    ).toEqual(['mark1']);
  });

  it('functional', () => {
    expect(importMatch(`"function loadable() {
        return importedWrapper('imported_1ubbetg_component', __webpack_require__.e(/*! import() | namedChunk-1 */ "namedChunk-1").then(__webpack_require__.t.bind(null, /*! ./DeferredRender */ "./src/DeferredRender.js", 7)));
      }"`)).toEqual(['1ubbetg']);
  });

  it('parcel', () => {
    expect(importMatch(`function _() {
        return importedWrapper('imported_mark1_component', require("_bundle_loader")(require.resolve('./HelloWorld3')));
    }`)).toEqual(['mark1']);
  });

  it('ie11 uglify', () => {
    expect(importMatch(`function _() {
        var t = 'imported_mark1_component';
    }`)).toEqual(['mark1']);
  });

  it('multiple imports in one line', () => {
    expect(importMatch(`function _() {
        "imported_1pn9k36_component", blablabla- importedWrapper("imported_-1556gns_component")
    }`)).toEqual(['1pn9k36', '-1556gns']);
  })
});