import isNodeDetected from 'detect-node';

export const isBackend = isNodeDetected || typeof window === 'undefined';
