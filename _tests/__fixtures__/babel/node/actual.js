import imported from 'react-imported-component';

const AsyncComponent0 = imported(() => import(/* webpackChunkName:namedChunk */'./MyComponent'));

const AsyncComponent1 = imported(() => import('./MyComponent'));

const AsyncComponent2 = imported(async () => await import('./MyComponent'));

const AsyncComponent3 = imported(() => Promise.all([import('./MyComponent'), import('./MyComponent')]));

const AsyncComponent4 = imported(async () => (await Promise.all([import('./MyComponent1'), import('./MyComponent2')]))[0]);

export default AsyncComponent1;