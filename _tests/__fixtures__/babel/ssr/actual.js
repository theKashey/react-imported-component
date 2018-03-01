import imported from 'react-imported-component';

const AsyncComponent1 = imported(() => import('./MyComponent'));

const AsyncComponent2 = imported(async () => await import('./MyComponent'));

const AsyncComponent3 = imported(() => Promise.all([import('./MyComponent'), import('./MyComponent')]));

export default AsyncComponent1;