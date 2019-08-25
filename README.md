<div align="center">
  <h1>IMPORTED COMPONENT ✂</h1>
  <br/>
  <img src="./assets/imported-logo.png" alt="imported components" width="409" align="center">
  <br/>
  <br/>
   SSR-friendly code splitting compatible with any platform.
  <br/>
   Deliver a better experience within a single import.
  <br/>
  <br/>
  
  <a href="https://www.npmjs.com/package/react-imported-component">
    <img src="https://img.shields.io/npm/v/react-imported-component.svg?style=flat-square" />
  </a>
    
  <a href="https://circleci.com/gh/theKashey/react-imported-component/tree/master">
   <img src="https://img.shields.io/circleci/project/github/theKashey/react-imported-component/master.svg?style=flat-square)" alt="Build status">
  </a> 

  <a href="https://www.npmjs.com/package/react-imported-component">
   <img src="https://img.shields.io/npm/dm/react-imported-component.svg" alt="npm downloads">
  </a> 

  <a href="https://bundlephobia.com/result?p=react-imported-component">
   <img src="https://img.shields.io/bundlephobia/minzip/react-imported-component.svg" alt="bundle size">
  </a> 

  <img src="https://badges.greenkeeper.io/theKashey/react-imported-component.svg" />
    
  <br/>
</div>

👉 [Usage](#usage)  |  [API](#api)  | [Server side](#ssr)  

 
Key features:
 - 1️⃣ Single source of truth - your __bundler drives__ everything.
 - 📖 __library__ level code __splitting__
 - 🧙️ Hybrid and __Prerendering__ compatible
 - 💡 __TypeScript__ bindings
 - ⚛️ __React.Lazy__ underneath
 - 🌟 Async on client, sync on server. Supports __Suspense__ (even on server side)
 - 📦 could work with __any bundler__ - webpack, rollup, parcel or puppeteer - it does not matter 
 
 Other features:
 - 🔥 Hot-Module-Replacement/React-Hot-Loader friendly
 - ⛓️ support forwardRef
 - ⚛️ Rect 16/Async/Hooks ready
 - 🛠 HOC, Component, Hooks API
 - 🐳 stream rendering support
 - 👥 partial hydration out of the box
 - 📦 and yes - this is the only __parcel-bundler compatible__ SSR-friendly React code splitting library
 
 👍 Better than [React.Lazy](https://reactjs.org/docs/code-splitting.html#reactlazy):
 - It __IS__ Lazy, just with some stuff around
 - SSR, Prerendering and Preloading support.
 - With or without Suspense, and easier Error cases support.
 
 👍 Better than [Loadable-Component](https://github.com/smooth-code/loadable-components):
 - Not bound to webpack.
 - Easy way to use per-browser(modern/legacy) bundles.
 - Strong typing.
 - Prerendering support
 
 👌 Not as good with
 - Loads chunks only after the `main one`, as long as loader code is bundled inside the main chunk, so it should be loaded first.
 - Not an issue with the `progressive hydration`, and might provide a better UX via feature detection.
 - Provides 👨‍🔬 technological workaround
    
<a name="usage"/>

# Usage

## Server side
Just a proper setup and a bit of magic

## Client side

### Component
`imported` provides 2 common ways to define a component, which are more different inside than outside 

- using `pre-lazy` API.
```javascript
import importedComponent from 'react-imported-component';
const Component = importedComponent( () => import('./Component'));

const Component = importedComponent( () => import('./Component'), {
  LoadingComponent: Spinner, // what to display during the loading
  ErrorComponent: FatalError // what to display in case of error
});

Component.preload(); // force preload

// render it
<Component... />
```

- using `lazy` API. It's almost the same `React.lazy` outside, and exactly the same inside.
```js
import {lazy, LazyBoundary} from 'react-imported-component'
const Component = lazy(() => import('./Component'));

const ClientSideOnly = () => (
    <Suspense>
     <Component />
    </Suspense> 
);

// or let's make it SSR friendly
const ServerSideFriendly = () => (
    <LazyBoundary> // LazyBoundary is Suspense on the client, and "nothing" on the server
      <Component />
    </LazyBoundary> 
)
```
`LazyBoundary` is a `Suspense` on Client Side, and `React.Fragment` on Server Side. Don't forget - "dynamic" imports are sync on a server.

Example: [React.lazy vs Imported-component](https://codesandbox.io/s/wkl95r0qw8)

### Hook
However, you may not load only components - you may load anything
```js
import {useImported} from 'react-imported-component'

const MyCalendarComponent = () => {
  const {
      moment,
      loading
    } = useImported(() => import("moment"));
  
  return loading ? "..." : <span>today is {moment(Date.now).format()}</span>
}

// or we could make it a bit more interesting...

const MyCalendarComponent = () => {
  const {
      imported: format  = x => "---", // default value is used while importing library
    } = useImported(
      () => import("moment"), 
      moment => x => moment(x).format // masking everything behind
    );
  
  return <span>today is {format(Date.now())</span>
}
```
What you could load using `useImported`? Everything - `imported` itself is using it to import components.

<a name="api"/>

# API

### Code splitting components
> import {*} from 'react-imported-component';
- `importedComponent(importFunction, [options]): ComponentLoader` - main API, default export, HOC to create imported component.
  - `importFunction - function which resolves with Component to be imported.
  - `options` - optional settings
  - `options.async` - activates react suspense support. Will throw a Promise in a Loading State - use it with Suspense in a same way you use __React.lazy__.
  - `options.LoadingComponent` - component to be shown in Loading state
  - `options.ErrorComponent` - component to be shown in Error state. Will re-throw error if ErrorComponent is not set. Use ErrorBoundary to catch it.  
  - `options.onError` - function to consume the error, if one will thrown. Will rethrow a real error if not set.
  - `options.exportPicker` - function to pick `not default` export from a `importFunction`
  - `options.render(Component, state, props) `- function to render the result. Could be used to tune the rendering.  
  
  - [static] `.preload` - static method to preload components.

- `lazy(importFunction)` - helper to mimic __React.lazy__ behavior

- `useImported(importFunction, exportPicker?)` - code splitting hook
  - `importFunction` - a function which resolves to `default` or `wildcard` import(T | {default:T})
  - `exportPicker` - function to pick "T" from the import

### Server side API
> import {*} from 'react-imported-component/server';
- `whenComponentsReady():Promise` - will be resolved, when all components are loaded. Usually on the next "Promise" tick.
- `drainHydrateMarks([stream])` - returns the currently used marks, and clears the list. 
- `printDrainHydrateMarks([stream])` - print our the `drainHydrateMarks`.
#### Stream API
- `createLoadableStream` - creates a steam
- `ImportedStream` - wraps another component with import usage tracker.
- `createLoadableTransformer` - creates nodejs StreamTransformer
- `getLoadableTrackerCallback` - helper factory for the stream transformer

### Client side API
> import {*} from 'react-imported-component/boot';
- `whenComponentsReady():Promise`, will be resolved, when all (loading right now) marks are loaded.
- `rehydrateMarks([marks]):Promise`, loads _marked_ async chunks.
- `injectLoadableTracker` - helper factory for the stream transformer
   
# Setup

## In short
1. Add `babel` plugin
2. Run `yarn imported-components src src/imported.js` to extract all your imports into a `run time chunk` (aka async-requires).
3. Replace `React.lazy` with our `lazy`, and `React.Suspense` with our `LazyBoundary`.
4. Add `printDrainHydrateMarks` to the server code code.
5. Add `rehydrateMarks` to the client code
6. Done. Just read the rest of readme for details.

There are examples for webpack, parcel, and react-snap. Just follow them.

## 1. Configure babel plugin
**On the server**:
```json
{
  "plugins": ["react-imported-component/babel", "babel-plugin-dynamic-import-node"/* might be optional for babel 7*/]
}
```
**On the client**:
```json
{
  "plugins": ["react-imported-component/babel"]
}
```
Imported-Component will hook into dynamic imports, providing extra information about files you want to load.

## 2. Add one more command into package.json
CLI command `imported-components [sources ROOT] [targetFile.js]` (use .ts for TypeScript)
```js
 "generate-imported-component": "imported-components src src/imported.js"
```
When you will execute this command - all `imports` among your codebase would be found and extracted to a file provided.
This will gave ability to orchestrate code-splitting later.

> The current implementation will discover and use all `imports`, even // commented ones

## 3. Start using `imported`, `lazy` or `useImported`
Without you using API provided nothing would work.

## 4. Add server side tracking
There are two ways to do it - in a single threaded way, and async
#### Single threaded
```js
  import { printDrainHydrateMarks, drainHydrateMarks } from 'react-imported-component';
  // this action will "drain" all currently used(by any reason) marks
  // AND print a script tag
  const html = renderToString(<YourApp />) + printDrainHydrateMarks();
  
  // OR return list of usedmarks, and yet again CLEAR the marks list.
  const html = renderToString(<YourApp />) + "<script>const marks="+JSON.stringify(drainHydrateMarks())+"</script>";
```
#### renderToStream or async render
```js
import {createLoadableStream} 'react-imported-component';

let importedStream = createLoadableStream();
// ImportedStream is a async rendering "provider"
const stream = renderToStream(
  <ImportedStream stream={importedStream}>
    <YourApp />
  </ImportedStream>
);

// you'd then pipe the stream into the response object until it's done
stream.pipe(res, { end: false });

// and finalize the response with closing HTML
stream.on('end', () =>
    // print marks used in the file
    res.end(`${printDrainHydrateMarks(importedStream)}</body></html>`),
)
```
However, the idea is just to use `streams` to separate renders
```js
const html = renderToString(<ImportedStream stream={importedStream}><YourApp /></ImportedStream>) + printDrainHydrateMarks(importedStream);
```

## 5. Add `rehydrateMarks` to the client code
Before rendering your application you have to ensure - all parts are loaded.
`rehydrateMarks` will load everything you need, and provide a promise to await.
```js
  import { rehydrateMarks } from 'react-imported-component';

  // this will trigger all marked imports, and await for competition.
  rehydrateMarks().then(() => {
    // better
    ReactDOM.hydrate(<App />, document.getElementById('main'));
    // or
    ReactDOM.render(<App />, document.getElementById('main'));
  });
```
`rehydrateMarks` accepts a list of `marks` from a server side(`drainHydrateMarks`), loads all 
necessary chunks and then resolves.

## A VERY IMPORTANT MOMENT
All other code splitting libraries are working a bit differently - they amend `webpack` building process,
gathering information about how the final chunks are assembled, and __injects the real scripts and styles__ to the server response,
thus all scripts, used to render something on the Server would be loaded in a parallel in on Client.
Literally - they are defined in the HTML.
`React-imported-component` is different, it starts "working" when the bundle is loaded, thus
__loading of chunks is deferred__. 
> In the normals conditions `react-imported-component` would be "slower" than a "webpack" library.

However, it is not a problem, as long as (for now), script execution is single trhreaded, and even you if can load multiple scripts
simultaneously - you can't __run__ them in parallel*.

Just change your entry point, to utilize this limitation.

Let's call it - __Scheduler optimization__. 

#### Simply static render
1. Split your app into `boot` and `main` parts
2. `rehydrate` at the boot
```js
 // index.js (boot)
 import './src/imported'; // the file generated by "generate-imported-component" (.2)
 import {rehydrateMarks} from 'react-imported-component/boot';
  
 rehydrateMarks(); // just start loading what's needed
  
 // load/execute the rest after letting the browser kick off chunk loading
 // for example wrapping it in two Promises (1ms timeout or setImmediate)
 Promise.resolve().then(() =>
   Promise.resolve().then(() => {
     // load the rest
     require('./main');
     // don't forget to `await rehydrateMarks()` before render
   })
 );
```
This will just start loading extra chunks before the main bundle got completely parsed and executed.

#### Stream render
> See examples/SSR/parcel-react-ssr/server-stream for details
1. Add your main bundle to the `head`, using __async__ script tag. Not defer! We have to do it async
2. Add `loadableTracker` at server side
```js
import {createLoadableTransformer, getLoadableTrackerCallback} from 'react-imported-component/server';
const importedTracker = createLoadableTransformer(
  loadableStream, // stream to observe 
  getLoadableTrackerCallback() // helper factory to create global tracker.
);

// pipe result of `renderToStream` throught it
const reactRenderStream = ReactDOM.renderToNodeStream(...).pipe(importedTracker);
```
3. Add `loadableTracker` at client side
```js
 // index.js
 import './src/imported'; // the file generated by "generate-imported-component" (.2)
 import {injectLoadableTracker} from 'react-imported-component/boot';
  
 injectLoadableTracker();
  
 // load the rest after letting the browser kick off chunk loading
 // for example wrapping it in two Promises (1ms timeout or setImmediate)
 Promise.resolve().then(() =>
   Promise.resolve().then(() => {
     require('./main')
   })
 );
```
This "hack", will first introduce all possible `imports` to the `imported-component`, then gave it a "tick"
to start loading required once, and only then execute the rest of the bundle.
While the rest(99%) of the bundle would make CPU busy - chunks would be loaded over the network.
> This is utilizing the differences between `parse`(unenviable) phase of script, and execute one.  

# Cooking receipts

## Partial hydration
Just wrap "partial hydrated" component with _another_ `ImportedStream` so everything needed for it would be not automatically loaded with the main stream.

## Hybrid render (CSR with prerendering)
This library could support hybrid rendering (aka pre-rendering) compatible in two cases:
- pre-render supports `state hydration`, like `getState` in [react-snap](https://github.com/stereobooster/react-snap). See our [example](https://github.com/theKashey/react-imported-component/tree/master/examples/hybrid/react-snap).
- for [rendertron](https://github.com/GoogleChrome/rendertron) or [https://prerender.io](https://prerender.io) follow `react-snap` example, just dump `state` using `setTimeout`.
- You may use `react-prerendered-component` to maintain a component state until async chunk is not loaded. See example below.

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


## CSS Support
### CSS-in-JS Support
First class. Literally CSS-in-JS library, like `styled-component` will do it by themselves, and there is nothing
to be managed by this library

### Static CSS Support
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

## Timeout to display "spinners"   
There is no build in timeouts to display Error or Loading states. You could control everything by yourself
- use react-delay, p-delay, p-timeout, or `Suspense` :P.   

## Component loader
You may use component api if you need it by any reason. 
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

## SSR (Server side rendering)
It was usually a headache - async components and SSR, which is currently sync.
React-imported-component break this cycle, making ServerSide rendering sync, and providing
comprehensive ways to rehydrate rendered tree on client. 
It will detect server-side environment and precache all used components.

###Bundler independent SSR
It does not matter how do you bundle your application - it could be even browser. The secrect sause is a __cli__ command, to extract all your imports into imports map, and use it later to load chunks by request.
- You might even dont have any separated chunk on the server side - it would still works.
- You might even ship module/nomodule scripts, using, for example, [devolution](https://github.com/theKashey/devolution) - no additional configuration would be required.

## Other loaders
Another loaders exists, and the only difference is in API, and how they manage (or not manage) SSR.

* (no SSR) React.Lazy 
* (webpack only) With [react-loadable](https://github.com/thejameskyle/react-loadable)
* (not compatible with hooks) [react-async-component](https://github.com/ctrlplusb/react-async-component)   
* (webpack only) [loadable-components](https://github.com/smooth-code/loadable-components)
* (webpack only) [react-universal-component](https://github.com/faceyspacey/react-universal-component)  

## Licence
MIT
