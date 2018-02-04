import imported from 'react-imported-component';

const AsyncComponent = imported(() => import('./MyComponent'));

export default AsyncComponent;