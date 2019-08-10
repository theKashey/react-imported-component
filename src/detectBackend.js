import isNodeDetected from 'detect-node';

const isBackend = isNodeDetected || (typeof window === 'undefined');

export default isBackend;