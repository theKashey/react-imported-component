<div align="center">
  <h1>IMPORTED COMPONENT ✂</h1>
  <br/>
  <img src="./assets/imported-logo.png" alt="imported components" width="409" align="center">
  <br/>
  <br/>
  Customs clearance for React Components shipped from overseas... 
  <br/>
  <br/>
  
  <a href="https://www.npmjs.com/package/react-imported-component">
    <img src="https://img.shields.io/npm/v/react-imported-component.svg?style=flat-square" />
  </a>
    
  <a href="https://circleci.com/gh/theKashey/react-imported-component/tree/master">
   <img src="https://img.shields.io/circleci/project/github/theKashey/react-imported-component/master.svg?style=flat-square)" alt="Build status">
  </a> 
    
  <img src="https://badges.greenkeeper.io/theKashey/react-imported-component.svg" />
    
  <br/>
</div>


### react-imported-component - world first any-bundler SSR-friendly loader.
Formerly - simple, but usable Async Component loader to be used with [React-Hot-Loader](https://github.com/gaearon/react-hot-loader).

Easy, universal, and could provide top results without any extra configuration.
 > Deliver a better experience with a single import.
 
Key features:
 - 🔥 Hot-Module-Replacement friendly.
 - 🌟 Async on client, sync on server.
 - 📦 could handle any bunder, and could load all the used async chunks in one "wave".
 - ✂️ could work with any import statement, passed from anywhere 
 - 🛠 HOC and Component API.
 - 🧙️ thus, composable.

## Usage

```javascript
import importedComponent from 'react-imported-component';
const Component = importedComponent( () => import('./Component'));

const Component = importedComponent( () => import('./Component'), {
  LoadingComponent: Spinner,
  ErrorComponent: FatalError
});

Component.preload();

// render it
<Component... />
```

## API

### Code splitting components
- `importedComponent(importFunction, [options]): ComponentLoader` - main API, default export, HOC to create imported component.
  - importFunction - function which resolves with Component to be imported.
  - options - optional settings
  - options.LoadingComponent - component to be shown in Loading state
  - options.ErrorComponent - component to be shown in Error state
  - options.onError - function to consume the error, if one will thrown. Will rethrow a real error if not set.
  - options.exportPicker - function to pick `not default` export from a `importFunction`
  - options.render(Component, state, props) - function to render the result. Could be used to tune the rendering.
  - options.async - activates react suspense support.
  
- importedComponent`.preload` - static method to preload components.

- `ComponentLoader`, the React Component variant of importedComponent. accepts `importFunction` as a `loadable` prop.

### Server side API
- `printDrainHydrateMarks()`, print our the `drainHydrateMarks`.
- `drainHydrateMarks()`, returns the currently used marks, and clears the list.

### Client side API
- `rehydrateMarks():Promise`, loads _marked_ async chunks.
- `whenComponentsReady():Promise`, will be resolved, when all marks loaded.
- `dryRender(renderFunction):Promise`, perform sandboxed render, and resolves "whenComponentsReady".
   
    

There is no build in timeouts to display Error or Loading states. You could control everything by yourself
- use react-delay, p-delay, p-timeout, or `suspence` :P.   

## Using dynamic import

One of the key features - "could work with any import statement, passed from anywhere". 
All others `full-cream` SSR bundlers relay on `import` statement inside their HOC,
like in the example just above, disallowing any composition.

React-imported-component is different. But still "full-cream".

```javascript
import importedComponent from 'react-imported-component';
const myImportFunction = () => import('./Component')
const Component = importedComponent(myImportFunction);
```

```javascript
import importedComponent from 'react-imported-component';
const mySuperImportedFactory = importFunction => importedComponent(importFunction); 
export default mySuperImportedFactory
//... in another file
mySuperImportedFactory(() => import('./Component'));
mySuperImportedFactory(async () => {
  const Component = await import('./Component');
  return () => <Component props />
});
```

If you need something complex, load more that one source for example.
```js
importedComponent(async () => {
  const [Component1, Component2, i18n] = await Promise.all([ 
    import('./Component1'),
    import('./Component2'),
    import('./i18n')
  ]);
  return (props) => <Component1><Component2 i18n={i18n} {...props} /></Component1>;
});
```

!!__BUT NOT__!!
```javascript
import importedComponent from 'react-imported-component';
const myImportFunction = () => import('./Component')
const myAnotherFunction = () => myImportFunction; 
const Component = importedComponent(myAnotherFunction);
```
Function with `import inside` should be __passed directly__ to importedComponent,
as long importedComponent will __analyze content of passed function__.

To use webpack chunks - just add comments inside an import function
```js
importedComponent( () => import(/* webpackChunkName:'pages' */'./Component'));
```

That is all. Component will be loaded in time and then displayed. And updated on module replacement of course.

#### Component loader.
As long `importedComponent` is a fabric function, which will produce React Component, which will perform the loading,
you may use React Component without calling fabric function.
```js
import {ComponentLoader} from 'react-imported-component';

const MyPage = () => (
   <ComponentLoader
       loadable={() => import('./Page.js')}
       // all fields are optional, and matches the same field of importedComponent.
       LoadingComponent={Loading}
       ErrorComponent={Error}
       onError
       
       exportPicker
       render
       async                 
   />
);
```
Actually `loadable` awaits for `loadableResource`, but could do auto transformation. 
```js
import {loadableResource} from 'react-imported-component';
loadable = {loadableResource(() => import('xxx'))}
```
loadableResource is just a sugar around `import`.

## Suspense (React Async)
Just pass down an option for `importedComponent`, or prop for `ComponentLoader, and 
catch the loading promise, imported component will throw if _loading state_ will took a place.

## SSR (Server side rendering)
It was usually a headache - async components and SSR, which is currently sync.
React-imported-component break this cycle, making ServerSide rendering sync, and providing
comprehensive ways to rehydrate rendered tree on client. 
It will detect server-side environment and precache all used components.

#### Full-cream SSR-to-Client
 
To enable full cream SSR follow these steps.
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
Imported-Component will hook into dynamic imports, providing extra information about files you want to load.

2. Add one more command into package.json
CLI command `imported-components [sources ROOT] [targetFile]` (use .ts for TypeScript)
```js
 "generate-imported-component": "imported-components src src/imported.js"
```
3. Execute this command, and react-imported-component __will generate__ a file with all dynamic imports you have used.
> That's how the magic, bundle independent bundling works.

4. Include this file on client-side, not important for server-side.
```js
import importedComponents from 'src/imported';
```
5. Export "used" components information from server side
```js
  import { printDrainHydrateMarks, drainHydrateMarks } from 'react-imported-component';
  // this action will drain all currently used(by any reason) marks
  // AND print a script tag
  const html = renderToString(<YourApp />) + printDrainHydrateMarks();
  
  // OR return list of usedmarks, and yet again CLEAR the marks list.
  const html = renderToString(<YourApp />) + "<script>const marks="+JSON.stringify(drainHydrateMarks())+"</script>";
```
>! The current version expects you to __synchronously render__ the application, and "drain" used `marks`.
"Drain" will return used marks, and empty the state, making the application ready for the next render.

6. Client side - rehydrate
```js
  import { rehydrateMarks } from 'react-imported-component';

  // this will trigger all marked imports, and await for competition.
  rehydrateMarks().then(() => {
    ReactDOM.render(<App />,document.getElementById('main'));
  });
```

#### Async SSR (renderToStream)
In case you have more than one rendering thread, for example in case of react-bootstrapper,
ReactDOM.renderToStream or _suspense_, default approach will not work.
You need one more component, to separate components my "rendering streams".
```js
import {ImportedStream, drainHydrateMarks} from 'react-imported-component';

let streamUID = 0;
const html = renderToString(
  <ImportedStream takeUID={uid => streamUID=uid}>
    <YourApp />
  </ImportedStream>) + printDrainHydrateMarks(streamUID);
``` 
Use `ImportedStream` to bound all imported component to one "streamId", and then - get used components.
Without `ImportedStream` streamId will be just 0 for all renders. With `ImportedStream` - it is a counter.

## SSR - Automagic (🤯, forget about it)
In case you could not use babel plugin, you could use "dryRender" API
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
   // better rehydrate
    .then(() => renderApplication(document.getElementById('realElement')))
```
__dryRender__ will render application offscreen, await for all parts to be loaded, and then
resolve the promise.
It is super-not-fast, and you will literally re-render everything twice, but it works 
(almost the same approach as react-async-component has).


## Comparison
* [react-loadable](https://github.com/thejameskyle/react-loadable)
  * The most popular one. Most tested one as a most used one.  
  * Loader: hybrid (import/require), could handle sets of imports("maps").
  * Front-end: RHL-not-friendly.
  * SSR: sync, webpack-bound, sees __all used chunks__.
  * Complex HOC based API. SSR will require additional pass(analyze webpack bundle)

* [react-async-component](https://github.com/ctrlplusb/react-async-component)   
  * The most magic one. Doing all the stuff underneath, invisible to the user.
  * Loader: import only
  * Front-end: RHL-not-friendly.
  * SSR: semi-async(async-bootstraper), __no wave reduction__, sees only currently loaded chunks.
  * Magic HOC based API. All SSR work are "magically" hidden behind bootstraper.
  * ** not compatible with React-Hot-Loader **. I mean "at all". 

* [loadable-components](https://github.com/smooth-code/loadable-components)
  * The most complex(inside) one. Just piece of Art. 
  * Loader: import only
  * Front-end: RHL-friendly. (by forced preloading)
  * SSR: semi-async(walkTree), __no wave reduction__, sees only currently loaded chunks.
  * Simple HOC based API

* [react-universal-component](https://github.com/faceyspacey/react-universal-component)
  * The most "webpack" one. Comprehensive solution, able to solve any case.
  * Loader: hybrid (import/require)
  * Front-end: RHL-friendly.
  * SSR: sync, webpack-bound, synchronous rendering. Sees __all used chunks__.
  * Very complex API
  
* [react-imported-component](https://github.com/theKashey/react-imported-component)
  * This library.
  * Loader: import only
  * Front-end: RHL-friendly.
  * SSR: semi-async(preload), bundler-independent, Sees __all used chunks__.
  * Component/HOC API, SSR could require additional pass (extract imports), or will lost wave reduction.

> Note 1: "RHL friendly" means that "loader" works with React-Hot-Loader out of the box.
In other case you will have to wrap async chunk's export with `hot` function, provided by Hot-Loader.
  
> Note 2: "__no wave reduction__" means - loader is produce several loading "waves"
#### Waves 
Let's imagine complex case - index.js will async-load 2 chunks, and __they also__ will load 2 async chunks.
SSR will result 6 marks, but only 2 of them will be resolved and executed on startup, as long the nested async calls
are described in the async chunks, __which are not loaded yet__.
Thus will result a two(or more) "waves" of loading. 

First you load files you can load(have imports to load them), next, a new code will start next "wave".

In 99.9% cases you will have only one "wave", and could loader reduce "waves" or not - does not matter.
But in complex cases, you can have a lot of nested async chunks - then better to use loader which could handle it. 
 
#### React-Hot-Loader
Very opinionated library. No loader __have__ to support it, as long this is altering the whole dev process and could not be repeated in production.
Read [this article](https://codeburst.io/react-hot-loader-considered-harmful-321fe3b6ca74) about pros and cons using react-hot-loader among your project.

#### Small Conclusion
There is no "best" or "worst" loader. They all almost similar on front-end and could solve most SSR specific tasks.
They are all litteraly is a ONE command, just API a bit differs.

You are free to pick any. Or found your own one. 

## Licence
MIT
