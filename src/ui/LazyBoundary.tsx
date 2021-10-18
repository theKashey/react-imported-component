import * as React from 'react';

import { isBackend } from '../utils/detectBackend';
import { useIsClientPhase } from '../utils/useClientPhase';

const LazyServerBoundary: React.FC<{
  fallback: NonNullable<React.ReactNode> | null;
}> = ({ children }) => <React.Fragment>{children}</React.Fragment>;

const LazyClientBoundary: React.FC<{
  fallback: NonNullable<React.ReactNode> | null;
}> = ({ children, fallback }) => (
  <React.Suspense
    // we keep fallback null during hydration as it is expected behavior for "ssr-ed" Suspense blocks - they should not "fallback"
    // see https://github.com/sebmarkbage/react/blob/185700696ebbe737c99bd6c4b678d5f2a923bd29/packages/react-dom/src/__tests__/ReactServerRenderingHydration-test.js#L668-L682
    fallback={useIsClientPhase() ? fallback : (undefined as any)}
  >
    {children}
  </React.Suspense>
);

/**
 * React.Suspense "as-is" replacement. Automatically "removed" during SSR and "patched" to work accordingly on the clientside
 *
 * @see {@link HydrationController} has to wrap entire application in order to provide required information
 */
export const LazyBoundary = isBackend ? LazyServerBoundary : LazyClientBoundary;
