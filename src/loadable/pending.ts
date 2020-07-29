let pending: Array<Promise<any>> = [];
export const addPending = (promise: Promise<any>) => pending.push(promise);
export const removeFromPending = (promise: Promise<any>) => (pending = pending.filter(a => a !== promise));
let readyFlag = false;
export const isItReady = () => readyFlag;

/**
 * waits for all necessary imports to be fulfilled
 */
export const done = (): Promise<void> => {
  if (pending.length) {
    readyFlag = false;
    return Promise.all(pending)
      .then(a => a[1])
      .then(done);
  }

  readyFlag = true;

  return Promise.resolve();
};
