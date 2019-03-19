react-snap-example
====

Using `react-imported-component` with `react-snap` without a flash of unloaded content.

working out of the box
```js
import imported, {rehydrateMarks, drainHydrateMarks} from 'react-imported-component';
// import chunk definition
import './imported-chunk';

const Component1 = imported(() => import('./splitted-1'));

// wait for all the used marks to load
rehydrateMarks(window.__IMPORTED_COMPONENTS__).then(() => {
  ReactDOM.render(<Component1/>, document.getElementById('app'));
});

// save used marks
window.snapSaveState = () => ({
  "__IMPORTED_COMPONENTS__": drainHydrateMarks(),
});
```