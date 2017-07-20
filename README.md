Simple, but usable Async Component loader to be used with [React-Hot-Loader](https://github.com/gaearon/react-hot-loader).

The only one WORKING loader, specially designed for RHL workflow.

[![NPM](https://nodei.co/npm/react-hot-component-loader.png?downloads=true&stars=true)](https://nodei.co/npm/react-hot-component-loader/)

#Usage

```javascript
import hotLoader from 'react-hot-component-loader';
const Component = hotLoader( () => import('./Component'));
```

That is all. Component will be loaded and displayed. And not state will be lost on Hot Module Replacement.


#Advanced Usage
```javascript
import hotLoader from 'react-hot-component-loader';
const Component = hotLoader( 
  () => import('./Component'),
  {
    LoadingComponent: // the one to be shown upon loading
    ErrorComponent: // the one to be shown in case of error
    exportPicker: (value) => value.default // in case you need not default export
  }
);
```

#Component API
Not HoC, but Component approach.
Very usable for React-Hot-Loader, as long does not creates new or hidden components. 
```javascript
import { HotComponentLoader } from 'react-hot-component-loader';
const Component = (props) => (
  <HotComponentLoader
    loader = {() => import('./Component')}
    ...
  />
);
```


Read more about it [on medium](https://codeburst.io/how-to-hot-load-react-component-in-7-days-part-2-react-28ce2b61d0c7)

#Licence
MIT
