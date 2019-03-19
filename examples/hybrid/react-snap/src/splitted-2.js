import React from 'react';
import {lazy} from "react-imported-component";

const Component3 = lazy(() => import('./splitted-3'));

export default () => (
  <span>
    This is code - splitted component 2, with
   -<React.Suspense fallback={'....'}>
    <Component3/>
   </React.Suspense>-
    inside Suspense
  </span>
)