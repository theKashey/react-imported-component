import { hot, setConfig } from 'react-hot-loader'
import * as React from 'react'
import Counter from './Counter'
import imported from 'react-imported-component'
import Portal from './Portal'

const Async = imported(() => import('./DeferredRender'));
const ShouldNotBeImported = imported(() => import('./NotImported'));

const App = () => (
  <h1>
    <p>{42}!</p>
    <p>C: <Counter /></p>
    <p>A: <Async /></p>
    <p>P: <Portal /></p>
    { Date.now()<0 && <ShouldNotBeImported />}
  </h1>
)

setConfig({ logLevel: 'debug' })

export default hot(module)(App)
