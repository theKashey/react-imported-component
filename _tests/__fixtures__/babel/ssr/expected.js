function importedWrapper(marker, name, realImport) {
  return realImport;
}

import imported from 'react-imported-component';

const AsyncComponent = imported(() => {
  importedWrapper('imported-component', 'unknown/MyComponent', Promise.resolve().then(() => require('./MyComponent')));
});

export default AsyncComponent;