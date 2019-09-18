import {assingLoadableMark} from './marks';
import {isBackend} from './detectBackend';
import {DefaultImport, Loadable, Mark, MarkMeta, Promised} from './types';
import {settings} from "./config";
import {getPreloaders} from "./preloaders";

type AnyFunction = (x: any) => any;

interface InnerLoadable<T> extends Loadable<T> {
  ok: boolean;
  promise: Promise<T> | undefined;
}

let pending: Array<Promise<any>> = [];

const LOADABLE_WEAK_SIGNATURE = new WeakMap<any, Loadable<any>>();
const LOADABLE_SIGNATURE = new Map<string, Loadable<any>>();

const addPending = (promise: Promise<any>) => pending.push(promise);
const removeFromPending = (promise: Promise<any>) => pending = pending.filter(a => a !== promise);
const trimImport = (str: string) => str.replace(/['"]/g, '');

export const importMatch = (functionString: string): Mark => {
  const markMatches = functionString.match(/`imported_(.*?)_component`/g) || [];
  return markMatches
    .map(match => match && trimImport((match.match(/`imported_(.*?)_component`/i) || [])[1]));
};

export const getFunctionSignature = (fn: AnyFunction | string) => (
  String(fn)
    .replace(/(["'])/g, '`')
    .replace(/\/\*([^\*]*)\*\//ig, '')
);


function toLoadable<T>(firstImportFunction: Promised<T>, autoImport = true): Loadable<T> {
  let importFunction = firstImportFunction;
  const _load = (): Promise<T> => (
    Promise.all([
      importFunction(),
      ...getPreloaders(),
    ]).then(([result]) => result)
  );
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
          }
        } as any
      }

      return this.loadIfNeeded().then(then);
    },

    reload() {
      if(this.promise) {
        this.promise = undefined;

        return this.load() as any;
      }
      return Promise.resolve();
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
  } else {
    console.warn('react-imported-component: no mark found at', importFunction);
  }

  // trigger preload on the server side
  if (isBackend && autoImport) {
    loadable.load();
  }

  return loadable;
}

let readyFlag = false;
export const isItReady = () => readyFlag;

export const done = (): Promise<void> => {
  if (pending.length) {
    readyFlag = false;
    return Promise
      .all(pending)
      .then(a => a[1])
      .then(done);
  }

  readyFlag = true;

  return Promise.resolve();
};

export const dryRender = (renderFunction: () => void) => {
  renderFunction();

  return Promise
    .resolve()
    .then(done);
};

export const markMeta: MarkMeta[] = [];

const assignMetaData = (mark: Mark, loadable: Loadable<any>, chunkName: string, fileName: string) => {
  markMeta.push({mark, loadable, chunkName, fileName});
};

type ImportedDefinition = [Promised<any>, string, string, boolean];

export const assignImportedComponents = (set: Array<ImportedDefinition>) => {
  const countBefore = LOADABLE_SIGNATURE.size;
  set.forEach(imported => {
    const allowAutoLoad = !(imported[3] || !settings.fileFilter(imported[2]));
    const loadable = toLoadable(imported[0], allowAutoLoad);
    assignMetaData(loadable.mark, loadable, imported[1], imported[2]);
  });

  if (countBefore === LOADABLE_SIGNATURE.size) {
    console.error('react-imported-component: no import-marks found, please check babel plugin')
  }

  done();
};

export function executeLoadable(importFunction: DefaultImport<any> | Loadable<any>) {
  if ('resolution' in importFunction) {
    return importFunction.reload();
  } else {
    return importFunction();
  }
}

export function getLoadable<T>(importFunction: DefaultImport<T> | Loadable<T>): Loadable<T> {
  if ('resolution' in importFunction) {
    return importFunction;
  }

  if (LOADABLE_WEAK_SIGNATURE.has(importFunction)) {
    return LOADABLE_WEAK_SIGNATURE.get(importFunction) as any;
  }

  // read cache signature
  const functionSignature = getFunctionSignature(importFunction);

  if (LOADABLE_SIGNATURE.has(functionSignature)) {
    const loadable = LOADABLE_SIGNATURE.get(functionSignature)!;
    loadable.replaceImportFunction(importFunction);

    return loadable as any;
  }

  const loadable = toLoadable(importFunction as any);
  LOADABLE_WEAK_SIGNATURE.set(importFunction, loadable);

  return loadable as any;
}

export const clearImportedCache = () => LOADABLE_SIGNATURE.clear();

export default toLoadable;
