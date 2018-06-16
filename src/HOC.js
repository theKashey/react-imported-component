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
 * @param {Function} [options.onError] - error handler. Will consume the real error.
 * @param {Function} [options.async] - enable React 16+ suspense.
 */
const loader = (loaderFunction, options = {}) => {
  const loadable = toLoadable(loaderFunction, !options.noAutoImport)

  const Imported = (props) => (
    <HotComponentLoader
      loadable={loadable}
      LoadingComponent={options.LoadingComponent}
      ErrorComponent={options.ErrorComponent}
      exportPicker={options.exportPicker}
      onError={options.onError}
      render={options.render}
      async={options.async}
      {...props}
    />
  );
  Imported.preload = () => loadable.load().catch( () => {});

  return Imported;
};

export default loader;