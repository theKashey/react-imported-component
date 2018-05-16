function importedWrapper(marker, name, realImport) {
  if (typeof __deoptimization_sideEffect__ !== 'undefined') {
    __deoptimization_sideEffect__(marker, name, realImport);
  }

  return realImport;
}

import imported from 'react-imported-component';

const AsyncComponent0 = imported(() => importedWrapper('imported-component', '18g2v0c', import( /* webpackChunkName:namedChunk */'./MyComponent')));

const AsyncComponent1 = imported(() => importedWrapper('imported-component', '18g2v0c', import('./MyComponent')));

const AsyncComponent2 = imported(async () => await importedWrapper('imported-component', '18g2v0c', import('./MyComponent')));

const AsyncComponent3 = imported(() => Promise.all([importedWrapper('imported-component', '18g2v0c', import('./MyComponent')), importedWrapper('imported-component', '18g2v0c', import('./MyComponent'))]));

const AsyncComponent4 = imported(async () => (await Promise.all([importedWrapper('imported-component', '-1qs8n90', import('./MyComponent1')), importedWrapper('imported-component', '9j5sqq', import('./MyComponent2'))]))[0]);

export default AsyncComponent1;