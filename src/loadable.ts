import {assingLoadableMark} from './marks';
import isBackend from './detectBackend';
import {Loadable, Promised} from './types';

type AnyFunction = (x: any) => any;

interface InnerLoadable<T> extends Loadable<T> {
  ok: boolean;
  promise: Promise<T> | undefined;
}

let pending: Array<Promise<any>> = [];

const LOADABLE_SIGNATURE = new Map<string, Loadable<any>>();

const addPending = (promise: Promise<any>) => pending.push(promise);
const removeFromPending = (promise: Promise<any>) => pending = pending.filter(a => a !== promise);
const trimImport = (str: string) => str.replace(/['"]/g, '');

export const importMatch = (functionString: string) => {
  const markMatches = functionString.match(/['"]imported_(.*?)_component['"]/g) || [];
  return markMatches
    .map(match => match && trimImport((match.match(/['"]imported_(.*?)_component['"]/i) || [])[1]));
};

const getFunctionSignature = (fn: AnyFunction) => String(fn);

function toLoadable<T>(importFunction: Promised<T>, autoImport = true): Loadable<T> {
  const _load = () => Promise.resolve().then(importFunction);
  const functionSignature = getFunctionSignature(importFunction);
  const mark = importMatch(functionSignature);

  let resolveResolution: AnyFunction;
  const resolution = new Promise<T>(r => {
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

    load() {
      if (!this.promise) {
        const promise = this.promise = _load()
          .then((payload) => {
            this.done = true;
            this.ok = true;
            this.payload = payload;
            this.error = null;
            removeFromPending(promise);
            resolveResolution(payload);
            return payload;
          }, (err) => {
            this.done = true;
            this.ok = false;
            this.error = err;
            removeFromPending(promise);
            throw err;
          });
        addPending(promise);
      }
      return this.promise;
    }
  };

  if (mark && mark.length) {
    LOADABLE_SIGNATURE.set(functionSignature, loadable);
    assingLoadableMark(mark, loadable);
  }

  // trigger preload on server side
  if (isBackend && autoImport) {
    loadable.load();
  }
  return loadable;
};

export const done = (): Promise<void> => {
  if (pending.length) {
    return Promise
      .all(pending)
      .then(a => a[1])
      .then(done);
  }

  return Promise.resolve();
};

export const dryRender = (renderFunction: () => void) => {
  renderFunction();

  return Promise
    .resolve()
    .then(done);
};

export const assignImportedComponents = (set: Record<string, Promised<any>>) => {
  Object
    .keys(set)
    .forEach(key => toLoadable(set[key]))
};

export const getLoadable = (importFunction: any) => {
  if ('resolution' in importFunction) {
    return importFunction;
  }

  // read cache signature
  const functionSignature = getFunctionSignature(importFunction);

  return (
    LOADABLE_SIGNATURE.get(functionSignature) ||
    toLoadable(importFunction, false)
  )
};

export default toLoadable;
