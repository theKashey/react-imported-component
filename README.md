### react-imported-component ✂

Simple, but usable Async Component loader to be used with [React-Hot-Loader](https://github.com/gaearon/react-hot-loader) (formerly known as react-hot-component-loader).

Easy, universal, and without any babel/webpack extra configuration. 
Deliver a better experience with a single import.
[![NPM](https://nodei.co/npm/react-imported-component.png?downloads=true&stars=true)](https://nodei.co/npm/react-imported-component/)

## Usage

```javascript
import importedComponent from 'react-imported-component';
const Component = importedComponent( () => import('./Component'));
```
To use webpack chunks - just add comments inside an import function
```js
deferredComponent( () => import(/* webpackChunkName:'pages' */'./Component'));
```

That is all. Component will be loaded in time and then displayed. And updated on module replacement of course.

## SSR (Server side rendering)
It was usually a headache - async components and SSR, which is currently sync. 
But now - dont do anything. React-imported-component will detect server-side environment and precache all used components.

But there is no straight way to ship all used code to the browser, to speedup rehydrate. Other libraries add some babel magic,
require you to specify import, require and file name for each import. Yep, it is not easy to solve this task...

Unless you will specify a `Mark` properly in advanced syntax.

## Advanced Usage
```javascript
import importedComponent from 'react-imported-component';
const Component = importedComponent( 
  () => import('./Component'),
  {
    mark: 'ImportantComponent', // unique name of this import. You cant use __filename here!
    LoadingComponent: ReactComponent, // the one to be shown upon loading
    ErrorComponent:  ReactComponent, // the one to be shown in case of error
    exportPicker: (value) => value.default // in case you need not default export
  }
);
```

## SSR - Continued
On server side you can collect all marked components you just used, and next await them to be loaded on client side

Server side - store used marks.
```js
  import { printDrainHydrateMarks, drainHydrateMarks } from 'react-imported-component';
  // this action will drain all currently used(by any reason) marks
  // AND print a script tag
  const html = renderToString(<YourApp />) + printDrainHydrateMarks();
  
  // OR return list of usedmarks
  const html = renderToString(<YourApp />) + "<script>const marks="+JSON.stringify(drainHydrateMarks())+"</script>";
```

Client side - rehydrate
```js
  import { rehydrateMarks, whenComponentsReady } from 'react-imported-component';

  // this will trigger all marked imports, and await for competition.
  rehydrateMarks().then(() => {
    ReactDOM.render(<App />,document.getElementById('main'));
  });
  
  // or you can specify list of markers manually
  rehydrateMarks(['mark1','mark2']).then(() => {
    ReactDOM.render(<App />,document.getElementById('main'));
  });
  
  //or you could split these actions..
  rehydrateMarks([...]);
  whenComponentsReady().then(() => {
   ReactDOM.render(<App />,document.getElementById('main'));
  });
```

## SSR - Automagic
Marks are not quite handy thing. Sometimes it is far more easy to rely on magic.
This approach is far more easy, but requires double rendering. Quite often it is much better than `bad` rehydration.
```js
 import {dryRender} from 'react-imported-component';

 // extract your rendering function
 const renderApplication = (targetElement) => {
   ReactDOM.render(<App />, targetElement);
 }
 
 // create invisible offscreen element
 const invisibleElement = document.createElement('div');
 
 dryRender(
   // render Application to offscreen
   () => renderApplication(invisibleElement)
   // await all components to be loaded
 )
   // unmount useless Application
    .then(() => unmountComponentAtNode(invisibleElement))
   // render and rehydrate the real application 
    .then(() => renderApplication(document.getElementById('realElement')))
```

## Licence
MIT
