import { hot, setConfig } from 'react-hot-loader'
import * as React from 'react'
import Counter from './Counter'
import imported from 'react-imported-component'
import Portal from './Portal'

const Async = imported(() => import('./DeferredRender'));

const App = () => (
  <h1>
    <p>{40}!</p>
    <p>C: <Counter /></p>
    <p>A: <Async /></p>
    <p>P: <Portal /></p>
  </h1>
)

setConfig({ logLevel: 'debug' })

export default hot(module)(App)
