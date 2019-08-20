// @ts-ignore
import isNodeDetected from 'detect-node';

export let isBackend = () => isNodeDetected || (typeof window === 'undefined');