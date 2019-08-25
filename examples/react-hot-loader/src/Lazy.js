import React from 'react'
import hidden from './HiddenComponent'

const Hidden = hidden();

const N = 24;
console.log('execute lazy', N);

export default () => (
  <div>
    Lazy {N} 44 YES NO YES NO
    <Hidden.counter />
  </div>
)
