import { Default } from '../types';

// eslint-disable-next-line @typescript-eslint/ban-types
type ObjectOrFunction = object | (() => any);

export function asDefault<T extends ObjectOrFunction>(mayBeNotDefault: T | Default<T>): Default<T> {
  if ('default' in mayBeNotDefault) {
    return mayBeNotDefault;
  }

  return {
    default: mayBeNotDefault,
  };
}

export const es6import = (module: any) => (module.default ? module.default : module);
