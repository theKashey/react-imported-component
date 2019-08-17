import * as React from 'react';
import {ImportedComponent} from './Component';
import toLoadable from './loadable';
import {DefaultImport, HOC} from "./types";
import {useLoadable} from "./useImported";
import {useEffect, useRef, useState} from "react";
import {asDefault} from "./utils";

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
const loader: HOC = (loaderFunction: any, options: any = {}) => {
  const loadable = toLoadable(loaderFunction, !options.noAutoImport);

  const ImportedComponent = ({importedProps = {}, ...props}: any):React.ReactElement => (
    <ImportedComponent
      loadable={loadable}
      LoadingComponent={options.LoadingComponent}
      ErrorComponent={options.ErrorComponent}
      exportPicker={options.exportPicker}
      onError={options.onError}
      render={options.render}
      async={options.async}
      forwardProps={props || {}}
      {...importedProps}
    />
  );

  const Imported = React.forwardRef<any, any>(
    ({importedProps = {}, ...props}, ref) => (
      <ImportedComponent
        {...props}
        importedProps={{...importedProps, forwardRef: ref}}
      />
    )) as any;

  /* eslint-enable */

  Imported.preload = () => {
    loadable.load().catch(() => ({}));
    return loadable.resolution;
  };
  Imported.done = loadable.resolution;

  return Imported;
};

export function lazy<T>(importer: DefaultImport<T>): React.FC<T> {
  const topLoadable = toLoadable(importer);

  return (props: T) => {
    const {loadable} = useLoadable(topLoadable);
    const trackedLoadable = useRef(loadable);

    useEffect(() => {
      if(trackedLoadable.current!==loadable) {
        trackedLoadable.current = loadable;
      }
    }, ['hot']);

    const [Lazy] = useState( () => React.lazy( () => trackedLoadable.current.loadIfNeeded().then(asDefault)))


    return (<Lazy {...props as any} />)
  }
}


export default loader;