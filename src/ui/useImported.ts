import { ComponentType, lazy, LazyExoticComponent, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getLoadable, InnerLoadable, isItReady } from '../loadable/loadable';
import { useMark } from '../loadable/marks';
import { DefaultComponentImport, DefaultImport, DefaultImportedComponent, Loadable } from '../types';
import { isBackend } from '../utils/detectBackend';
import { es6import } from '../utils/utils';
import { streamContext } from './context';

function loadLoadable(loadable: Loadable<any>, callback: (l: any) => void) {
  const upd = () => callback({});

  loadable.loadIfNeeded().then(upd, upd);
}

function updateLoadable(loadable: Loadable<any>, callback: (l: any) => void) {
  // support HMR
  if (process.env.NODE_ENV === 'development') {
    const upd = () => callback({});

    (loadable as InnerLoadable<any>)._probeChanges().then(changed => changed && upd(), upd);
  }
}

interface ImportedShape<T> {
  imported?: T;
  error?: any;
  loading?: boolean;

  loadable: Loadable<any>;

  retry(): void;
}

interface HookOptions {
  import?: boolean;
  track?: boolean;
}

/**
 * react hook to wrap `import` with a tracker
 * used by {@link useImported}
 * @internal
 */
export function useLoadable<T>(loadable: Loadable<T>, options: HookOptions = {}) {
  const UID = useContext(streamContext);

  const wasDone = loadable.done;

  const [, forceUpdate] = useState({});

  useMemo(() => {
    if (options.import !== false) {
      if (options.track !== false) {
        useMark(UID, loadable.mark);
      }
      if (!wasDone) {
        loadLoadable(loadable, forceUpdate);
      } else {
        updateLoadable(loadable, forceUpdate);
      }
    }
    return true;
  }, [loadable, options.import, options.track]);

  if (isBackend && !isItReady() && loadable.isLoading()) {
    /* tslint:disable:next-line no-console */
    console.error(
      'react-imported-component: trying to render a component which is not ready. You should `await whenComponentsReady()`?'
    );
  }

  // use mark
  // retry
  const retry = useCallback(() => {
    if (!loadable) {
      return;
    }
    loadable.reset();
    forceUpdate({});
    updateLoadable(loadable, forceUpdate);
  }, [loadable]);

  if (process.env.NODE_ENV !== 'production') {
    if (isBackend) {
      if (!loadable.done) {
        /* tslint:disable:next-line no-console */
        console.error(
          'react-imported-component: using not resolved loadable. You should `await whenComponentsReady()`.'
        );
      }
    }
  }

  return useMemo(
    () => ({
      loadable,
      retry,
      update: forceUpdate,
    }),
    [loadable, retry, forceUpdate]
  );
}

/**
 * The code splitting hook
 * @param {Function} importer - an function with `import` inside it
 * @param {Function} [exportPicker] - a "picker" of the export inside
 * @param {HookOptions} options
 * @param {Boolean} [options.import=true] - should the component be imported. Allow to defer execution.
 * @param {Boolean} [options.track=true] - allows disabling tracking of components, isolating them to SSR
 *
 * @return {Object}
 *  - imported: if non empty - the data is loaded
 *  - error: if non empty - there is an error
 *  - loading: if true - then it's still loading
 *  - loadable: the under laying reference
 *  - retry: retry if case of failure
 *
 *  @example
 *  const { imported: Imported, loadable } = useImported(importer);
 *  if (Imported) {
 *    // yep, it's imported
 *    return <Imported {...children} />;
 *  }
 *  // else throw resolution
 *  throw loadable.resolution;
 */
export function useImported<T, K = T>(
  importer: DefaultImport<T> | Loadable<T>,
  exportPicker: (x: T) => K = es6import,
  options: HookOptions = {}
): ImportedShape<K> {
  const topLoadable = getLoadable(importer);
  const { loadable, retry } = useLoadable<T>(topLoadable, options);

  const { error, done, payload } = loadable;
  const loading = loadable.isLoading();

  return useMemo(() => {
    if (error) {
      return {
        error,
        loadable,
        retry,
      };
    }

    if (done) {
      return {
        imported: exportPicker(payload as T),
        loadable,
        retry,
      };
    }

    return {
      loading,
      loadable,
      retry,
    };
  }, [error, loading, payload, loadable]);
}

/**
 * A mix of React.lazy and useImported
 * @see {@link useImported}
 * @example
 *  const Component = useLazy(() => import('./MyComponent');
 *  return <Component />
 */
export function useLazy<T>(importer: DefaultComponentImport<T>): LazyExoticComponent<ComponentType<T>> {
  const [{ resolve, reject, lazyComponent }] = useState(() => {
    /* tslint:disable no-shadowed-variable */
    let resolve: any;
    let reject: any;
    const promise = new Promise<DefaultImportedComponent<T>>((rs, rej) => {
      resolve = rs;
      reject = rej;
    });

    return {
      resolve,
      reject,
      lazyComponent: lazy(() => promise),
    };
    /* tslint:enable */
  });

  const { error, imported } = useImported(importer);

  useEffect(() => {
    if (error) {
      reject!(error);
    }
    if (imported) {
      resolve!(imported);
    }
  }, [error, imported]);

  return lazyComponent;
}
