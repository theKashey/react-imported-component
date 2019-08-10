import React from 'react';
import PropTypes from 'prop-types';
import isBackend from './detectBackend';

const LazyBoundary = ({children}) => <React.Fragment>{children}</React.Fragment>;
LazyBoundary.propTypes = {
  children: PropTypes.node,
};

export default isBackend ? LazyBoundary : React.Suspense;