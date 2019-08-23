// @ts-ignore
import isNodeDetected from 'detect-node';

export const isBackend = isNodeDetected || (typeof window === 'undefined');

if (isBackend) {
  console.log('this is backend!');
}