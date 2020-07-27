import { isNode } from 'detect-node-es';

export const isBackend = isNode || typeof window === 'undefined';
