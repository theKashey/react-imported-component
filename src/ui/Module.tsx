import * as React from 'react';

import { getLoadable } from '../loadable/loadable';
import { DefaultImport, FullImportModuleProps, HOCModuleType, ImportModuleProps } from '../types';
import { useImported } from './useImported';

/**
 * @deprecated use {@link useImported} instead
 */
export function ImportedModule<T>(props: FullImportModuleProps<T>): React.ReactElement | null {
  const { error, loadable, imported: module } = useImported(props.import);

  if (error) {
    throw error;
  }

  if (module) {
    return props.children(module);
  }

  if (!props.fallback) {
    throw loadable.resolution;
  }

  return props.fallback as any;
}

/**
 * @deprecated use {@link useImported} instead
 */
export function importedModule<T>(loaderFunction: DefaultImport<T>): HOCModuleType<T> {
  const loadable = getLoadable(loaderFunction);

  const Module = ((props: ImportModuleProps<T>) => (
    <ImportedModule {...props} import={loadable} fallback={props.fallback} />
  )) as HOCModuleType<T>;

  Module.preload = () => {
    loadable.load().catch(() => ({}));

    return loadable.resolution;
  };

  Module.done = loadable.resolution;

  return Module;
}
