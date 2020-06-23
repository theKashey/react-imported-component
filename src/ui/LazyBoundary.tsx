import * as React from 'react';
import { isBackend } from '../utils/detectBackend';

const LazyBoundary: React.FC<{
  fallback: NonNullable<React.ReactNode> | null;
}> = ({ children }) => <React.Fragment>{children}</React.Fragment>;

/**
 * React.Suspense "as-is" replacement
 */
const Boundary = isBackend ? LazyBoundary : React.Suspense;

export default Boundary;
