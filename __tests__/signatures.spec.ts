import { getFunctionSignature, importMatch } from '../src/utils/signatures';

describe('signatures', () => {
  const a = (i: any) => i;
  const b = (i: any) => i;

  it('extract markers from function', () => {
    expect(importMatch(getFunctionSignature(() => a('imported_XXYY_component')))).toEqual(['XXYY']);
  });

  it('work similar for similar functions', () => {
    expect(getFunctionSignature(() => a('imported_XXYY_component'))).toBe(
      getFunctionSignature(() => b('imported_XXYY_component'))
    );
  });
});

describe('importMatch', () => {
  it('standard', () => {
    expect(
      importMatch(
        getFunctionSignature(
          `() => importedWrapper('imported_mark1_component', Promise.resolve(TargetComponent)), true)`
        )
      )
    ).toEqual(['mark1']);
  });

  it('webpack', () => {
    expect(
      importMatch(
        getFunctionSignature(
          `() => importedWrapper("imported_mark1_component", __webpack_require__.e(/*! import() */ 0).then(__webpack_require__.bind(null, /*! ./components/Another */ "./app/components/Another.tsx")))`
        )
      )
    ).toEqual(['mark1']);
  });

  it('webpack-prod', () => {
    expect(
      importMatch(
        getFunctionSignature(
          `() => importedWrapper('imported_mark1_component',__webpack_require__.e(/*! import() */ 0).then(__webpack_require__.bind(null, /*! ./components/Another */ "./app/components/Another.tsx")))`
        )
      )
    ).toEqual(['mark1']);
  });

  it('functional', () => {
    expect(
      importMatch(
        getFunctionSignature(`"function loadable() {
        return importedWrapper('imported_1ubbetg_component', __webpack_require__.e(/*! import() | namedChunk-1 */ "namedChunk-1").then(__webpack_require__.t.bind(null, /*! ./DeferredRender */ "./src/DeferredRender.js", 7)));
      }"`)
      )
    ).toEqual(['1ubbetg']);
  });

  it('parcel', () => {
    expect(
      importMatch(
        getFunctionSignature(`function _() {
        return importedWrapper('imported_mark1_component', require("_bundle_loader")(require.resolve('./HelloWorld3')));
    }`)
      )
    ).toEqual(['mark1']);
  });

  it('ie11 uglify', () => {
    expect(
      importMatch(
        getFunctionSignature(`function _() {
        var t = 'imported_mark1_component';
    }`)
      )
    ).toEqual(['mark1']);
  });

  it('multiple imports in one line', () => {
    expect(
      importMatch(
        getFunctionSignature(`function _() {
        "imported_1pn9k36_component", blablabla- importedWrapper("imported_-1556gns_component")
    }`)
      )
    ).toEqual(['1pn9k36', '-1556gns']);
  });

  it('maps function signatures', () => {
    expect(getFunctionSignature(`import('file')`)).toEqual(getFunctionSignature(`import(/* */'file')`));

    expect(getFunctionSignature(`import('file')`)).toEqual('import(`file`)');
  });

  it('maps function signatures after terser pass', () => {
    expect(getFunctionSignature('()=>$(`imported_-f5674t_component`,n.e(3).then(n.bind(null,`xxx`,7)))')).toEqual(
      getFunctionSignature('()=>$(`imported_-f5674t_component`,x.e(3).then(x.bind(null,`xxx`,7)))')
    );
    expect(getFunctionSignature('()=>$(`imported_-f5674t_component`,n.e(3).then(n.bind(null,`xxx`,7)))')).toEqual(
      '()=>$(`imported_-f5674t_component`,-we(3).-wbind(null,`xxx`,7)))'
    );
  });

  it('maps function with different wrappers', () => {
    expect(getFunctionSignature('()=>P("imported_-is59m_component",t.e(41).then(t.bind(null,"./Promo.jsx")))')).toEqual(
      getFunctionSignature('()=>s("imported_-is59m_component",n.e(41).then(n.bind(null,"./Promo.jsx")))')
    );
    expect(getFunctionSignature('()=>P("imported_-is59m_component",t.e(41).then(t.bind(null,"./Promo.jsx")))')).toEqual(
      '()=>$(`imported_-is59m_component`,-we(41).-wbind(null,`./Promo.jsx`)))'
    );
  });
});
