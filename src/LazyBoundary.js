import React from 'react';
import PropTypes from 'prop-types';
const isBrowser = (typeof window !== 'undefined');

const LazyBoundary = ({ children }) => <React.Fragment>{children}</React.Fragment>;
LazyBoundary.propTypes = {
  children: PropTypes.node,
};

export default !isBrowser ? LazyBoundary : React.Suspense;