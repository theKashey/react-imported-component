import React from 'react';
import HotComponentLoader from './Component';
import toLoadable from './loadable';

/**
 *
 * @param {Function} loaderFunction - () => import('a'), or () => require('b')
 * @param {Object} [options]
 * @param {React.Component} [options.LoadingComponent]
 * @param {React.Component} [options.ErrorComponent]
 * @param {Function} [options.exportPicker] - default behaviour - picks default export
 * @param {String} [options.mark] - SSR mark
 */
const loader = (loaderFunction, options = {}) =>
  (props) => (
    <HotComponentLoader
      ssrMark={options.mark}
      loadable={toLoadable(loaderFunction, true, options.mark)}
      LoadingComponent={options.LoadingComponent}
      ErrorComponent={options.ErrorComponent}
      exportPicker={options.exportPicker}
      {...props}
    />
  );

export default loader;