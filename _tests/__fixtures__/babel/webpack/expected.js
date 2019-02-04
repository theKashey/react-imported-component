var importedWrapper = function (marker, realImport) {
  if (typeof __deoptimization_sideEffect__ !== 'undefined') {
    __deoptimization_sideEffect__(marker, realImport);
  }

  return realImport;
};

import imported from 'react-imported-component';
const AsyncComponent0 = imported(() => importedWrapper("imported_18g2v0c_component", import(
/* webpackChunkName:namedChunk */
'./MyComponent')));
const AsyncComponent1 = imported(() => importedWrapper("imported_18g2v0c_component", import('./MyComponent')));
const AsyncComponent2 = imported(async () => await importedWrapper("imported_18g2v0c_component", import('./MyComponent')));
const AsyncComponent3 = imported(() => Promise.all([importedWrapper("imported_18g2v0c_component", import('./MyComponent')), importedWrapper("imported_18g2v0c_component", import('./MyComponent'))]));
const AsyncComponent4 = imported(async () => (await Promise.all([importedWrapper("imported_-1qs8n90_component", import('./MyComponent1')), importedWrapper("imported_9j5sqq_component", import('./MyComponent2'))]))[0]);
export default AsyncComponent1;