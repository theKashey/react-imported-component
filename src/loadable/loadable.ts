import { DefaultImport, Loadable } from '../types';
import { getFunctionSignature, importMatch } from '../utils/signatures';
import { done } from './pending';
import { LOADABLE_SIGNATURE, LOADABLE_WEAK_SIGNATURE } from './registry';
import { toLoadable } from './toLoadable';
import { toKnownSignature } from './utils';

/**
 * try to perform a render and loads all chunks required for it
 * @deprecated
 */
export const dryRender = (renderFunction: () => void) => {
  renderFunction();

  return Promise.resolve().then(done);
};

export function executeLoadable(importFunction: DefaultImport<any> | Loadable<any>) {
  if ('resolution' in importFunction) {
    return importFunction.reload();
  } else {
    return importFunction();
  }
}

/**
 * wraps an `import` function with a tracker
 * @internal
 * @param importFunction
 */
export function getLoadable<T>(importFunction: DefaultImport<T> | Loadable<T>): Loadable<T> {
  if ('resolution' in importFunction) {
    return importFunction;
  }

  if (LOADABLE_WEAK_SIGNATURE.has(importFunction)) {
    return LOADABLE_WEAK_SIGNATURE.get(importFunction) as any;
  }

  const rawSignature = getFunctionSignature(importFunction);
  const ownMark = importMatch(String(rawSignature));
  // read cache signature
  const functionSignature = toKnownSignature(rawSignature, ownMark);

  if (LOADABLE_SIGNATURE.has(functionSignature)) {
    // tslint:disable-next-line:no-shadowed-variable
    const loadable = LOADABLE_SIGNATURE.get(functionSignature)!;
    loadable.replaceImportFunction(importFunction);

    return loadable as any;
  }

  if (ownMark) {
    LOADABLE_SIGNATURE.forEach(({ mark, importer }) => {
      if (mark[0] === ownMark[1] && mark.join('|') === ownMark.join('|')) {
        // tslint:disable-next-line:no-console
        console.warn(
          'Another loadable found for an existing mark. That\'s possible, but signatures must match (https://github.com/theKashey/react-imported-component/issues/192):',
          {
            mark,
            knownImporter: importer,
            currentImported: importFunction,
            currentSignature: String(importFunction),
            knownSignature: String(importer),
          }
        );
      }
    });
  }

  const loadable = toLoadable(importFunction as any);
  LOADABLE_WEAK_SIGNATURE.set(importFunction, loadable);

  return loadable as any;
}

/**
 * Reset `importers` weak cache
 * @internal
 */
export const clearImportedCache = () => LOADABLE_SIGNATURE.clear();
