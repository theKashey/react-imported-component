import { AnyFunction, Mark } from '../types';

const trimImport = (str: string) => str.replace(/['"]/g, '');

export const importMatch = (functionString: string): Mark => {
  const markMatches = functionString.match(/`imported_(.*?)_component`/g) || [];

  return markMatches.map((match) => match && trimImport((match.match(/`imported_(.*?)_component`/i) || [])[1]));
};

/**
 * the intention of this function is to "clear some (minification) noise from the function
 * basically from file to file different "short" names could be used
 * @param fn
 */
export const getFunctionSignature = (fn: AnyFunction | string): string =>
  String(fn)
    // quotes
    .replace(/(["'])/g, '`')

    // comments
    .replace(/\/\*([^\*]*)\*\//gi, '')

    // webpack specific
    .replace(/Promise.resolve\([^)]*\)/, '-we()')
    .replace(/\w+.e\([^)]*\)/, '-we()')
    .replace(/\w+.\w.bind\(/, '-wbind(')
    .replace(/\w+.bind\(/, '-wbind(')

    // prefix imported
    .replace(/([A-z0-9_]+)\(`imported_/g, '$(`imported_');
