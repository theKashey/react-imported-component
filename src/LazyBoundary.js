import React from 'react';
import PropTypes from 'prop-types';
import isNode from 'detect-node';

const LazyBoundary = ({children}) => <React.Fragment>{children}</React.Fragment>;
LazyBoundary.propTypes = {
  children: PropTypes.node,
};

export default isNode ? LazyBoundary : React.Suspense;