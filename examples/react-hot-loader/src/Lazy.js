import React from 'react'
import hidden from './HiddenComponent'

const Hidden = hidden();

const N = 240;
console.log('execute lazy', N);

export default () => (
  <div>
    Lazy {N}
    <Hidden.counter />
  </div>
)
