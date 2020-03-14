import { AnyFunction, Mark } from './types';

const trimImport = (str: string) => str.replace(/['"]/g, '');

export const importMatch = (functionString: string): Mark => {
  const markMatches = functionString.match(/`imported_(.*?)_component`/g) || [];
  return markMatches.map(match => match && trimImport((match.match(/`imported_(.*?)_component`/i) || [])[1]));
};

export const getFunctionSignature = (fn: AnyFunction | string) =>
  String(fn)
    .replace(/(["'])/g, '`')
    .replace(/\/\*([^\*]*)\*\//gi, '')
    .replace(/([A-z0-9_]+)\(`imported_/g, '$(`imported_');
