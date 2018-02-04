### react-imported-component ✂

[![CircleCI status](https://img.shields.io/circleci/project/github/theKashey/react-imported-component/master.svg?style=flat-square)](https://circleci.com/gh/theKashey/react-imported-component/tree/master)

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
> Mark is just a mark, nothing more. 
It helps react-imported-component to understand that `THIS` component on frontend, is `THAT` component on backend.
Mark should be unique.

## Advanced Usage
```javascript
import importedComponent from 'react-imported-component';
const Component = importedComponent( 
  () => import('./Component'),
  {
    mark: 'ImportantComponent', // unique name of this import. You can't use __filename here!
    LoadingComponent: ReactComponent, // the one to be shown upon loading
    ErrorComponent:  ReactComponent, // the one to be shown in case of error
    exportPicker: (value) => value.default // in case you need not default export
  }
);
```

## SSR - babel+
You could use babel plugin to automagically inject the `mark`
This, relatively boring operation, can be automated using our babel plugin `react-imported-component/babel`.

>Dynamic `import` syntax is natively supported by Webpack / Parcel but not by node. That's why you have to configure Babel differently for server and client:

**On the server**:

```json
{
  "plugins": ["react-imported-component/babel", "babel-plugin-dynamic-import-node"]
}
```

**On the client**:

```json
{
  "plugins": ["react-imported-component/babel"]
}
```

To have a different configuration for client and server, you can use [Babel env option](https://babeljs.io/docs/usage/babelrc/#env-option).
> PS: This is 100% the same approach, as loadable-components have. More of it - react-imported-component is using their babel plugin.
 

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
>! The current version expects you to __synchronously render__ the application, and "drain" used `marks`.
"Drain" will return used marks, and empty the state, making the application ready for the next render.

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
This approach is far more easy, but requires double rendering. But nothing more - no client or server side code change.
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

## SSR - Things you should know.
1. The waves.
Let's imagine complex case - index.js will async-load 2 chunks, and __they also__ will load 2 async chunks.
SSR will result 6 marks, but only 2 of them will be resolved and executed on startup, as long the nested async calls
described in the async chunks, which are not loaded yet.
Thus will result a two(or more) "waves" of loading. 

2. Marks
All SSR-ready async-loaders uses this approach - somehow detect the used components and trigger preload.
The difference is how to detect the used ones.
React-imported-component just "name" them.

3. HRM
Major async-loaders are HRM-non-friendly. 
The only way to make this loader HRM friendly is to use React-Hot-Loader, 
as long react-imported-component just react of "forceUpdate", caused by React-Hot-Loader.
Without React-Hot-Loader this solution is also HRM-not-friendly

## Comparison
* [react-loadable](https://github.com/thejameskyle/react-loadable).
  * The most standard one  
  * Loader: hybrid (import/require)
  * Front-end: Webpack bound. HRM-not-friendly.
  * SSR: stable, sync, webpack-bound, synchronous rendering requires babel plugin. 

* [react-async-component](https://github.com/ctrlplusb/react-async-component)  
  * The most strange one
  * Loader: import only
  * Front-end: HRM-not-friendly
  * SSR: stable, semi-async(async-bootstraper), standard

* [loadable-components](https://github.com/smooth-code/loadable-components)
  * The most complex one
  * Loader: import only
  * Front-end: HRM-not-friendly.
  * SSR: stable, semi-async(walkTree), standard.

* [react-universal-component](https://github.com/faceyspacey/react-universal-component)
  * The most "full" one. 
  * Loader: hybrid (import/require)
  * Front-end: HRM-friendly.
  * SSR: stable, sync, webpack-bound, synchronous rendering. The only loaded with "waves-reduction" support.
  
* [react-imported-component](https://github.com/theKashey/react-imported-component)
  * The most simple one
  * Loader: import only
  * Front-end: HRM-friendly.
  * SSR: not-stable, semi-async(preload), standard.
  
If you have super-complex chunk-splitting, and any page requires a few, nested in each other, chunks to render - use __react-universal-component__.

In other cases it does not matter. They all are "ok".   

## Licence
MIT
