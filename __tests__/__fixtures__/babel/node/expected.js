var importedWrapper = require('react-imported-component/wrapper');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

import imported from 'react-imported-component';
const AsyncComponent0 = imported(() => importedWrapper("imported_18g2v0c_component", Promise.resolve().then(() => _interopRequireWildcard(require('./MyComponent')))));
const AsyncComponent1 = imported(() => importedWrapper("imported_18g2v0c_component", Promise.resolve().then(() => _interopRequireWildcard(require('./MyComponent')))));
const AsyncComponent2 = imported(async () => await importedWrapper("imported_18g2v0c_component", Promise.resolve().then(() => _interopRequireWildcard(require('./MyComponent')))));
const AsyncComponent3 = imported(() => Promise.all([importedWrapper("imported_18g2v0c_component", Promise.resolve().then(() => _interopRequireWildcard(require('./MyComponent')))), importedWrapper("imported_18g2v0c_component", Promise.resolve().then(() => _interopRequireWildcard(require('./MyComponent'))))]));
const AsyncComponent4 = imported(async () => (await Promise.all([importedWrapper("imported_-1qs8n90_component", Promise.resolve().then(() => _interopRequireWildcard(require('./MyComponent1')))), importedWrapper("imported_9j5sqq_component", Promise.resolve().then(() => _interopRequireWildcard(require('./MyComponent2'))))]))[0]);
export default AsyncComponent1;