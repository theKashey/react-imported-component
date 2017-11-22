import isNode from 'detect-node';
import LOADABLE_MARKS from './marks';

let pending = [];

const addPending = promise => pending.push(promise);
const removeFromPending = promise => pending = pending.filter(a => a !== promise);

const toLoadable = (importFunction, autoImport = true, mark = false) => {
  const _load = () => Promise.resolve().then(importFunction);
  const loadable = {
    importFunction,
    done: false,
    ok: false,
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
            removeFromPending(promise);
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
    if (LOADABLE_MARKS[mark]) {
      if (isNode) {
        console.warn('react-deferred-component: mark', mark, 'already used for', LOADABLE_MARKS[mark].importFunction.toString());
      }
    }
    LOADABLE_MARKS[mark] = loadable;
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

export default toLoadable;