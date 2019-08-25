// @ts-ignore
import * as crc32 from 'crc-32';
import {Default} from "./types";

type ObjectOrFunction = object | (() => any);

export function asDefault<T extends ObjectOrFunction>(mayBeNotDefault: T | Default<T>): Default<T> {
  if ('default' in mayBeNotDefault) {
    return mayBeNotDefault;
  }

  return {
    default: mayBeNotDefault,
  }
}

export const es6import = (module: any) => (
  module.default
    ? module.default
    : module
);

export const encipherImport = (str: string) => crc32.str(str).toString(32);