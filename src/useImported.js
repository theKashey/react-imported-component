import React, {useCallback, useContext, useEffect, useState} from 'react';
import {UIDConsumer} from "./context";
import {es6import, getLoadable} from "./loadable";
import {useMark} from "./marks";

const loadLoadable = (loadable, callback) => {
  const upd = () => callback(loadable);
  loadable.then(upd, upd);
};

export const useImported = (importer, exportPicker = es6import) => {
  const UID = useContext(UIDConsumer);
  const [loadable, setLoadable] = useState(null);

  // use mark
  useMark(UID, getLoadable(importer).mark);

  // retry
  const retry = useCallback(() => {
    if (!loadable) {
      return;
    }
    loadable.reset();
    setLoadable(null);
    loadLoadable(loadable, setLoadable);
  }, [loadable]);

  // kick loading effect
  useEffect(() => {
    const loadable = getLoadable(importer);
    loadLoadable(loadable, setLoadable);
  }, []);

  if (loadable) {
    if (loadable.done) {
      return {
        component: exportPicker(loadable.payload),
        retry,
      }
    }
    if (loadable.error) {
      return {
        error: loadable.error,
        retry,
      }
    }
  }

  return {
    loading: true,
    retry,
  }
};

export const useLazy = (importer, exportPicker = es6import) => {
  const UID = useContext(UIDConsumer);
  const [loadable, setLoadable] = useState(() => {
    const loadable = getLoadable(importer);
    useMark(UID, loadable.mark);
    loadable.loadIfNeeded();
    return loadable;
  });

  const retry = useCallback(() => {
    loadable.reset();
    loadLoadable(loadable, setLoadable);
  }, [loadable]);

  return loadable.promise;
};