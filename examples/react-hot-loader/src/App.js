// @flow
import {hot, setConfig} from 'react-hot-loader'
import * as React from 'react'
import Counter from './Counter'
import imported, {ComponentLoader, printDrainHydrateMarks} from 'react-imported-component'
import Portal from './Portal'
import Indirect from './indirectUsage';

imported(() => import(/* webpackChunkName: "namedChunk-1" */'./DeferredRender'), {
  async: true
});

const Async = imported(() => import(/* webpackChunkName: "namedChunk-1" */'./DeferredRender'));
const Async2 = imported(() => import(/* webpackChunkName: "namedChunk-2" */'./DeferredRender'));
const ShouldNotBeImported = imported(() => import(/* webpackChunkName: "namedChunk-2" */'./NotImported'));

const App = () => (
  <h1>
    <ComponentLoader
      loadable={() => import(/* webpackChunkName: "namedChunk-1" */'./DeferredRender')}
    />
    <p>{42}!</p>
    <p>C: <Counter/></p>
    <p>A1: <Async/></p>
    <p>A2: <Async2/></p>
    <p>P: <Portal/></p>
    <Indirect/>
    {Date.now() < 0 && <ShouldNotBeImported/>}
  </h1>
)

setConfig({logLevel: 'debug'})

setTimeout(() => console.log('marks', printDrainHydrateMarks()), 1000);

export default hot(module)(App)
