import {useCallback, useContext, useEffect, useState, lazy, useRef, LazyExoticComponent, ComponentType} from 'react';
import {streamContext} from "./context";
import {getLoadable} from "./loadable";
import {useMark} from "./marks";
import {DefaultImport, DefaultImportedComponent, Loadable} from './types';
import {es6import} from "./utils";

function loadLoadable(loadable: Loadable<any>, callback: (l: any) => void) {
  const upd = () => callback({});

  loadable
    .loadIfNeeded()
    .then(upd, upd);
}

interface ImportedShape<T> {
  Component?: T;
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

  return {
    loadable,
    retry,
    update: forceUpdate,
  };
}

export function useImported<T, K = T>(importer: DefaultImport<T>, exportPicker: (x: T) => K = es6import): ImportedShape<K> {
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
      Component: exportPicker(loadable.payload as T),
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

export function useLazy<T>(importer: DefaultImport<T>): LazyExoticComponent<ComponentType<T>> {
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

  const {error, component} = useImported(importer);

  useEffect(() => {
    if (error) {
      reject!(error)
    }
    if (component) {
      resolve!(error);
    }
  }, [error, component]);

  return lazyComponent;
}