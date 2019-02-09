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
 - ⛓️ support forwardRef.
 - 💡 TS, Flow, Rect 16/Async ready.
 - 🌟 Async on client, sync on server. Supports Suspense (even on server side)
 - 📦 could handle any bunder, and could load all the used async chunks in one "wave".
 - ✂️ could work with any import statement, passed from anywhere 
 - 🛠 HOC and Component API.
 - 🧙️ thus, composable.
 - 📦 and yes - this is the only __Parcel-bundler compatible__ SSR-friendly React code splitting library.

## Usage

```javascript
import importedComponent from 'react-imported-component';
const Component = importedComponent( () => import('./Component'));

const Component = importedComponent( () => import('./Component'), {
  LoadingComponent: Spinner,
  ErrorComponent: FatalError
});

Component.preload(); // force preload

// render it
<Component... />

//
import {lazy, LazyBoundary} from 'react-imported-component'
const Component = lazy( () => import('./Component'));

<Suspense>
 <Component />
</Suspense> 

or

<LazyBoundary>
  <Component />
</LazyBoundary> 
```
`LazyBoundary` is a `Suspense` on Client Side, and `React.Fragment` on Server Side. Don't forget - "dynamic" imports are sync on server.

Example: [React.lazy vs Imported-component](https://codesandbox.io/s/wkl95r0qw8)
## API

### Code splitting components
- `importedComponent(importFunction, [options]): ComponentLoader` - main API, default export, HOC to create imported component.
  - importFunction - function which resolves with Component to be imported.
  - options - optional settings
  - options.LoadingComponent - component to be shown in Loading state
  - options.async - activates react suspense support. Will throw a Promise in a Loading State - use it with Suspense in a same way you use __React.lazy__.
  - options.ErrorComponent - component to be shown in Error state. Will re-throw error if ErrorComponent is not set. 
  Use ErrorBoundary to catch it.  
  - options.onError - function to consume the error, if one will thrown. Will rethrow a real error if not set.
  - options.exportPicker - function to pick `not default` export from a `importFunction`
  - options.render(Component, state, props) - function to render the result. Could be used to tune the rendering.  
  
- importedComponent`.preload` - static method to preload components.

- `lazy` - helper to mimic __React.lazy__ behavior (it is just `_importedComponent_(fn, { async: true })`).

- `ComponentLoader`, the React Component variant of importedComponent. accepts `importFunction` as a `loadable` prop.

### Server side API
- `printDrainHydrateMarks()`, print our the `drainHydrateMarks`.
- `drainHydrateMarks()`, returns the currently used marks, and clears the list.
- `whenComponentsReady():Promise`, will be resolved, when all components are loaded. Usually on the next "Promise" tick.

### Client side API
- `rehydrateMarks():Promise`, loads _marked_ async chunks.
- `whenComponentsReady():Promise`, will be resolved, when all marks are loaded.
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

Use `LazyBoundary` helper for SSR - friendly _Suspense_.

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
    // better
    ReactDOM.hydrate(<App />,document.getElementById('main'));
    // or
    ReactDOM.render(<App />,document.getElementById('main'));
  });
```

#### Async SSR (renderToStream)
In case you have more than one rendering thread, for example in case of react-bootstrapper,
ReactDOM.renderToStream or _suspense_, default approach will not work.
You need one more component, to separate components my "rendering streams".
```js
import {ImportedStream, drainHydrateMarks} from 'react-imported-component';

// assuming res === express response
function renderApplication(res) {
    let streamUID = 0;
    // ImportedStream is a async rendering "provider"
    const stream = renderToStream(
      <ImportedStream takeUID={uid => streamUID=uid}>
        <YourApp />
      </ImportedStream>);
    
    // you'd then pipe the stream into the response object until it's done
    stream.pipe(
      res,
      { end: false },
    )
    
    // and finalize the response with closing HTML
    stream.on('end', () =>
      // print marks used in the file
      res.end(`${printDrainHydrateMarks(streamUID)}</body></html>`),
    )
}
``` 
Use `ImportedStream` to bound all imported component to one "streamId", and then - get used components.
Without `ImportedStream` streamId will be just 0 for all renders. With `ImportedStream` - it is a counter.

# CSS Support
## CSS-in-JS Support
First class. Literally CSS-in-JS library, like `styled-component` will do it by themselves, and there is nothing
to be managed by this library

## Static CSS Support
This library __does not__ support CSS as CSS, as long it's bundler independent. However, there is 
a bundler independent way to support CSS:
1. Configure you bundler, and server side rendering to emit the right `classNames` (just remove `style-loader` from webpack configuration)
2. Use `used-styles` to inject used __css files__ to the resulting HTML.

In short (streamed example is NOT short)
```js
  const markup = ReactDOM.renderToString(<App />)
  const usedStyles = getUsedStyles(markup, lookup);
```

If you need `streamed` example with __reduced TTFB__ - 
please refer to [used-styles](https://github.com/theKashey/used-styles) documentation, or our [parcel-bundler stream server example](https://github.com/theKashey/react-imported-component/tree/master/examples/SSR/parcel-react-ssr/stream-server).



### Works better in pair (boiled-place-less code splitting)
You might not need to wait for all the chunks to be loaded before you can render you app - 
just use [react-prerendered-component](https://github.com/theKashey/react-prerendered-component).
```js
import imported from 'react-imported-component';
import {PrerenderedComponent} from "react-prerendered-component";

const AsyncComponent = imported(() => import('./myComponent.js'));

<PrerenderedComponent
  // component will "go live" when chunk loading would be done
  live={AsyncComponent.preload()}
>
  // until component is not "live" prerendered HTML code would be used
  // that's why you need to `preload`
  <AsyncComponent/>
</PrerenderedComponent>
```
React-prerendered-component is another way to work with code splitting, which makes everything far better.

## Another loaders
Another loaders exists, and the only difference is in API, and how they manage (or not manage) SSR.

* React.Lazy  
* With [react-loadable](https://github.com/thejameskyle/react-loadable)
* [react-async-component](https://github.com/ctrlplusb/react-async-component)   
* [loadable-components](https://github.com/smooth-code/loadable-components)
* [react-universal-component](https://github.com/faceyspacey/react-universal-component)
  
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
They are all litteraly is a ONE command(import), plus some sugar around.

The problem comes from Server Side....


## Licence
MIT
