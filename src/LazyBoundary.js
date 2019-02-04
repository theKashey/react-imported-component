import React from 'react';
import isNode from 'detect-node';

export const LazyBoundary = isNode
  ? ({children}) => <React.Fragment>{children}</React.Fragment>
  : React.Suspense;