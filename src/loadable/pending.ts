/**
 * pending indicates any ongoing procceses
 */
let pending: Array<Promise<any>> = [];

export const addPending = (promise: Promise<any>): void => {
  pending.push(promise);
};

export const removeFromPending = (promise: Promise<any>): void => {
  pending = pending.filter((a) => a !== promise);
};

/**
 * is it really ready?
 */
let readyFlag = false;

export const isItReady = (): boolean => readyFlag;

/**
 * waits for all necessary imports to be fulfilled
 */
export const done = (): Promise<void> => {
  console.log('pending:', pending.length);
  if (pending.length) {
    readyFlag = false;

    return Promise.all(pending)
      .then((a) => a[1])
      .then(done);
  }

  readyFlag = true;

  return Promise.resolve();
};
