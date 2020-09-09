import { Loadable } from '../types';

export const LOADABLE_WEAK_SIGNATURE = new WeakMap<any, Loadable<any>>();
export const LOADABLE_SIGNATURE = new Map<string, Loadable<any>>();
