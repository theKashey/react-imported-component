function importedWrapper(marker, name, realImport) {
  return realImport;
}

import imported from 'react-imported-component';

const AsyncComponent1 = imported(() => importedWrapper('imported-component', '18g2v0c', Promise.resolve().then(() => require('./MyComponent'))));

const AsyncComponent2 = imported(async () => await Promise.resolve().then(() => require('./MyComponent')));

const AsyncComponent3 = imported(() => Promise.all([Promise.resolve().then(() => require('./MyComponent')), Promise.resolve().then(() => require('./MyComponent'))]));

export default AsyncComponent1;