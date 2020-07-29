import { AnyFunction, Loadable, Promised } from '../types';
import { isBackend } from '../utils/detectBackend';
import { getFunctionSignature, importMatch } from '../utils/signatures';
import { assingLoadableMark } from './marks';
import { addPending, removeFromPending } from './pending';
import { getPreloaders } from './preloaders';
import { LOADABLE_SIGNATURE } from './registry';
import { toKnownSignature } from './utils';

export interface InnerLoadable<T> extends Loadable<T> {
  ok: boolean;
  promise: Promise<T> | undefined;

  _probeChanges(): Promise<boolean>;
}

export function toLoadable<T>(firstImportFunction: Promised<T>, autoImport = true): Loadable<T> {
  let importFunction = firstImportFunction;
  const loadImportedComponent = (): Promise<T> =>
    Promise.all([importFunction(), ...getPreloaders()]).then(([result]) => result);
  const functionSignature = getFunctionSignature(importFunction);
  const mark = importMatch(functionSignature);

  let resolveResolution: AnyFunction;
  const resolution = new Promise<void>(r => {
    resolveResolution = r;
  });

  const loadable: InnerLoadable<T> = {
    // importFunction,
    mark,
    resolution,
    done: false,
    ok: false,
    error: null,
    payload: undefined,
    promise: undefined,

    isLoading() {
      return !!this.promise && !this.done;
    },

    reset() {
      this.done = false;
      this.ok = true;
      this.payload = undefined;
      this.promise = undefined;
    },

    replaceImportFunction(newImportFunction) {
      importFunction = newImportFunction;
    },

    get importer() {
      return importFunction;
    },

    then(cb, err) {
      if (this.promise) {
        return this.promise.then(cb, err);
      }
      if (err) {
        err();
      }
      return Promise.reject();
    },

    loadIfNeeded() {
      if (this.error) {
        this.reset();
      }
      if (!this.promise) {
        this.load();
      }
      return this.promise!;
    },

    tryResolveSync(then) {
      if (this.done) {
        const result = then(this.payload as any);
        return {
          then(cb: any) {
            // synchronous thenable - https://github.com/facebook/react/pull/14626
            cb(result);
            return Promise.resolve(result);
          },
        } as any;
      }

      return this.loadIfNeeded().then(then);
    },

    reload() {
      if (this.promise) {
        this.promise = undefined;

        return this.load() as any;
      }
      return Promise.resolve();
    },

    _probeChanges() {
      return Promise.resolve(importFunction())
        .then(payload => payload !== this.payload)
        .catch(err => {
          throw err;
        });
    },

    load() {
      if (!this.promise) {
        const promise = (this.promise = loadImportedComponent().then(
          payload => {
            this.done = true;
            this.ok = true;
            this.payload = payload;
            this.error = null;
            removeFromPending(promise);
            resolveResolution(payload);
            return payload;
          },
          err => {
            this.done = true;
            this.ok = false;
            this.error = err;
            removeFromPending(promise);
            throw err;
          }
        ));
        addPending(promise);
      }
      return this.promise;
    },
  };

  if (mark && mark.length) {
    LOADABLE_SIGNATURE.set(toKnownSignature(functionSignature, mark), loadable);
    assingLoadableMark(mark, loadable);
  } else {
    if (process.env.NODE_ENV !== 'development') {
      // tslint:disable-next-line:no-console
      console.warn(
        'react-imported-component: no mark found at',
        importFunction,
        'Please check babel plugin or macro setup, as well as imported-component\'s limitations. See https://github.com/theKashey/react-imported-component/issues/147'
      );
    }
  }

  // trigger preload on the server side
  if (isBackend && autoImport) {
    loadable.load();
  }

  return loadable;
}
