import {useCallback, useContext, useEffect, useState, lazy, useRef, LazyExoticComponent, ComponentType} from 'react';
import {streamContext} from "./context";
import {getLoadable} from "./loadable";
import {useMark} from "./marks";
import {DefaultComponentImport, DefaultImport, DefaultImportedComponent, Loadable} from './types';
import {es6import} from "./utils";
import {isBackend} from "./detectBackend";

function loadLoadable(loadable: Loadable<any>, callback: (l: any) => void) {
  const upd = () => callback({});

  loadable
    .loadIfNeeded()
    .then(upd, upd);
}

interface ImportedShape<T> {
  imported?: T;
  error?: any;
  loading?: boolean;

  loadable: Loadable<any>;

  retry(): void;
}

export function useLoadable<T>(loadable: Loadable<T>) {
  const UID = useContext(streamContext);
  const [, forceUpdate] = useState(() => {
    // use mark
    useMark(UID, loadable.mark);
    loadable.loadIfNeeded();

    return {};
  });

  useEffect(() => {
    loadLoadable(loadable, forceUpdate);
  }, [loadable]);

  // use mark
  // retry
  const retry = useCallback(() => {
    if (!loadable) {
      return;
    }
    loadable.reset();
    forceUpdate({});
    loadLoadable(loadable, forceUpdate);
  }, [loadable]);

  if (process.env.NODE_ENV !== 'production') {
    if(isBackend) {
      if(!loadable.done) {
        console.error('react-imported-component: using not resolved loadable. You should `await whenComponentsReady()`.')
      }
    }
  }

  return {
    loadable,
    retry,
    update: forceUpdate,
  };
}

export function useImported<T, K = T>(importer: DefaultImport<T> | Loadable<T>, exportPicker: (x: T) => K = es6import): ImportedShape<K> {
  const [topLoadable, setLoadable] = useState(getLoadable(importer));
  const postEffectRef = useRef(false);
  const {
    loadable,
    retry,
  } = useLoadable<T>(topLoadable);

  // kick loading effect
  useEffect(() => {
    if (postEffectRef.current) {
      setLoadable(getLoadable(importer))
    }

    postEffectRef.current = true;
  }, ['hot']);

  if (loadable.error) {
    return {
      error: loadable.error,
      loadable,
      retry,
    }
  }

  if (loadable.done) {
    return {
      imported: exportPicker(loadable.payload as T),
      loadable,
      retry,
    }
  }

  return {
    loading: loadable.isLoading(),
    loadable,
    retry,
  };
}

export function useLazy<T>(importer: DefaultComponentImport<T>): LazyExoticComponent<ComponentType<T>> {
  const [{resolve, reject, lazyComponent}] = useState(() => {
    let resolve: any;
    let reject: any;
    let promise = new Promise<DefaultImportedComponent<T>>((rs, rej) => {
      resolve = rs;
      reject = rej;
    });

    return {
      resolve,
      reject,
      lazyComponent: lazy(() => promise),
    }
  });

  const {error, imported} = useImported(importer);

  useEffect(() => {
    if (error) {
      reject!(error)
    }
    if (imported) {
      resolve!(imported);
    }
  }, [error, imported]);

  return lazyComponent;
}