import * as React from 'react';
import { useMemo } from 'react';

import { getLoadable } from '../loadable/loadable';
import { ComponentOptions, DefaultComponentImport, HOCOptions, HOCType, LazyImport } from '../types';
import { isBackend } from '../utils/detectBackend';
import { asDefault } from '../utils/utils';
import { ImportedComponent } from './Component';
import { useLoadable } from './useImported';

/**
 * creates a "lazy" component, like `React.lazy`
 * @see {@link useImported} or {@link useLazy}
 * @param {Function} loaderFunction - () => import('a'), or () => require('b')
 * @param {Object} [options]
 * @param {React.Component} [options.LoadingComponent]
 * @param {React.Component} [options.ErrorComponent]
 * @param {Function} [options.onError] - error handler. Will consume the real error.
 * @param {Function} [options.async = false] - enable React 16+ suspense.
 *
 * @example
 * const PageA = imported('./pageA', { async: true });
 */
function loader<P, K = P>(
  loaderFunction: DefaultComponentImport<P>,
  baseOptions: Partial<ComponentOptions<P, K>> & HOCOptions = {}
): HOCType<P, K> {
  let loadable = getLoadable(loaderFunction);

  const Imported = React.forwardRef<any, any>(function ImportedComponentHOC({ importedProps = {}, ...props }, ref) {
    const options = { ...baseOptions, ...importedProps };
    // re-get loadable in order to have fresh reference
    loadable = getLoadable(loaderFunction);

    return (
      <ImportedComponent
        loadable={loadable}
        LoadingComponent={options.LoadingComponent}
        ErrorComponent={options.ErrorComponent}
        onError={options.onError}
        render={options.render}
        async={options.async}
        forwardProps={props || {}}
        forwardRef={ref}
      />
    );
  }) as HOCType<any, any>;

  Imported.preload = () => {
    loadable.load().catch(() => ({}));

    return loadable.resolution;
  };
  Object.defineProperty(Imported, 'done', {
    get() {
      return loadable.resolution;
    },
  });

  return Imported;
}

const ReactLazy = React.lazy;
/**
 * React.lazy "as-is" replacement
 */
export function lazy<T>(importer: LazyImport<T>): React.FC<T> {
  if (isBackend) {
    return loader(importer);
  }

  if (process.env.NODE_ENV !== 'production') {
    // lazy is not hot-reloadable
    if ((module as any).hot) {
      return loader(importer, { async: true });
    }
  }

  const topLoadable = getLoadable(importer);

  return function ImportedLazy(props: T) {
    const { loadable } = useLoadable(topLoadable);

    const Lazy = useMemo(() => ReactLazy(() => loadable.tryResolveSync(asDefault as any) as any), []);

    return <Lazy {...(props as any)} />;
  };
}

export default loader;
