import isNode from 'detect-node';
import {loadMark} from './marks';

let pending = [];

const addPending = promise => pending.push(promise);
const removeFromPending = promise => pending = pending.filter(a => a !== promise);
const trimImport = str => str.replace(/['"]/g, '');

export const importMatch = functionString => {
  const markMatches = functionString.match(/['"]imported_(.*)_component['"]/g) || [];
  return markMatches.map(match => trimImport(match.match(/['"]imported_(.*)_component['"]/i)[1]));
}

const toLoadable = (importFunction, autoImport = true) => {
  const _load = () => Promise.resolve().then(importFunction);
  const mark = importMatch(importFunction.toString());

  let resolveResolution;
  const resolution = new Promise(r => {
    resolveResolution = r;
  });

  const loadable = {
    importFunction,
    mark,
    resolution,
    done: false,
    ok: false,
    error: null,
    payload: undefined,
    promise: undefined,

    reset() {
      this.done = false;
      this.ok = true;
      this.payload = undefined;
      this.promise = undefined;
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

  if (mark) {
    mark.forEach(subMark => loadMark(subMark, loadable))
  }

  if (isNode && autoImport) {
    loadable.load();
  }
  return loadable;
};

export const done = () => {
  if (pending.length) {
    return Promise
      .all(pending)
      .then(a => a[1])
      .then(done)
  } else {
    return Promise.resolve();
  }
};

export const dryRender = (renderFunction) => {
  renderFunction();
  return Promise
    .resolve()
    .then(done);
};

export const assignImportedComponents = (set) => {
  Object
    .keys(set)
    .forEach(key => toLoadable(set[key]))
};

export default toLoadable;
