// @ts-ignore
import * as crc32 from 'crc-32';

interface Default<T> {
  default: T;
}

type ObjectOrFunction = object | (() => any);

export function asDefault<T extends ObjectOrFunction>(obj: T | Default<T>): Default<T> {
  if ('default' in obj) {
    return obj;
  }

  return {
    default: obj
  }
}

export const encipherImport = (string: string) => crc32.str(string).toString(32);