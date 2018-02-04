import imported from 'react-imported-component';

const AsyncComponent = imported(() => import('./MyComponent'), {
  mark: './MyComponent:unknown'
});

export default AsyncComponent;