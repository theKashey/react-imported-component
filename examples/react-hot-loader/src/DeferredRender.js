import React from 'react'
import imported, {remapImports} from 'react-imported-component';
import {Portal} from 'react-portal'
import hidden from './HiddenComponent'

const V = 2;
console.log('run ', V);
const SubAsync = imported(() => {
  console.log('import ', V);
  return remapImports(import('./SubAsync'), x => x.SubAsync)
});

const Hidden = hidden();

const APortal = () => (
  <Portal>
    This is a async portal
    <Hidden.counter/>
  </Portal>
);

export default () => (
  <div>
    ASYNC 77
    <Hidden.counter/>
    and <APortal/>
    + <SubAsync/>
  </div>
);
