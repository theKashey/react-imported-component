### react-imported-component ✂

[![CircleCI status](https://img.shields.io/circleci/project/github/theKashey/react-imported-component/master.svg?style=flat-square)](https://circleci.com/gh/theKashey/react-imported-component/tree/master)

### World first any-bundler SSR-friendly loader.
Formerly - simple, but usable Async Component loader to be used with [React-Hot-Loader](https://github.com/gaearon/react-hot-loader).

Easy, universal, and could provide top results without any extra configuration. 
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
React-imported-component will detect server-side environment and precache all used components.

To enable SSR just
1. Add babel plugin 
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

2. Add one more command into package.json
```js
 "generate-imported-component": "imported-components src src/imported.js"
```
3. Execute this command, and react-imported-component will generate a file with all dynamic imports you have used.
4. Include this file on client side
```js
import importedComponents from 'src/imported';
```
5. Export "used" components from server side
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

6. Client side - rehydrate
```js
  import { rehydrateMarks, whenComponentsReady } from 'react-imported-component';

  // this will trigger all marked imports, and await for competition.
  rehydrateMarks().then(() => {
    ReactDOM.render(<App />,document.getElementById('main'));
  });
    
  //or you could split these actions..  
  whenComponentsReady().then(() => {
   ReactDOM.render(<App />,document.getElementById('main'));
  });
```

## Comparison
* [react-loadable](https://github.com/thejameskyle/react-loadable).
  * The most standard one  
  * Loader: hybrid (import/require)
  * Front-end: Webpack bound. HRM-not-friendly.
  * SSR: stable, sync, webpack-bound, synchronous rendering requires babel plugin.
  * Bad API 

* [react-async-component](https://github.com/ctrlplusb/react-async-component)  
  * The most strange one
  * Loader: import only
  * Front-end: HRM-not-friendly
  * SSR: stable, semi-async(async-bootstraper), standard
  * Bad API

* [loadable-components](https://github.com/smooth-code/loadable-components)
  * The most complex one
  * Loader: import only
  * Front-end: HRM-not-friendly.
  * SSR: stable, semi-async(walkTree), standard.
  * Good API

* [react-universal-component](https://github.com/faceyspacey/react-universal-component)
  * The most "full" one. 
  * Loader: hybrid (import/require)
  * Front-end: HRM-friendly.
  * SSR: stable, sync, webpack-bound, synchronous rendering. The only loaded with "waves-reduction" support.
  * Complex API
  
* [react-imported-component](https://github.com/theKashey/react-imported-component)
  * The most simple one
  * Loader: import only
  * Front-end: HRM-friendly.
  * SSR: stable, semi-async(preload), standard, bundler-independent
  * Good API
  
For now __react-imported-component__ is the most inteligent loader, which will work for any bundler.

## Licence
MIT
