// @flow
import {hot, setConfig} from 'react-hot-loader'
import * as React from 'react'
import Counter from './Counter'
import imported, {lazy, ComponentLoader, printDrainHydrateMarks} from 'react-imported-component'
import Portal from './Portal'
import Indirect from './indirectUsage';

imported(() => import(/* webpackChunkName: "namedChunk-1" */'./DeferredRender'), {
  async: true
});

const Async = imported(() => import(/* webpackChunkName: "namedChunk-1" */'./DeferredRender'));
const Async2 = lazy(() => {
    console.log('loading lazy');
    return import(/* webpackChunkName: "namedChunk-2" */'./Lazy')
});
const ShouldNotBeImported = imported(() => import(/* webpackChunkName: "namedChunk-2" */'./NotImported'));

const App = () => (
  <h1>
    <p>Component loaded</p>
    <ComponentLoader
      loadable={() => import(/* webpackChunkName: "namedChunk-1" */'./DeferredRender')}
    />
    <p>test!</p>
    <hr/>
    <p>C: <Counter/></p>
    <hr/>
    <p>Imported: <Async/></p>
    <hr/>
    <React.Suspense fallback={"loading"}>
      <p>Lazy: <Async2/></p>
    </React.Suspense>
    <hr/>
    <p>Portal: <Portal/></p>
    <hr/>
    <Indirect/>
    {Date.now() < 0 && <ShouldNotBeImported/>}
  </h1>
)

setConfig({logLevel: 'debug'})

setTimeout(() => console.log('marks', printDrainHydrateMarks()), 1000);

export default hot(module)(App)
