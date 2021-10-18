import { settings } from '../configuration/config';

export const toKnownSignature = (signature: string, marks: string[]): string =>
  (!settings.checkSignatures && marks.join('|')) || signature;

export const markerOverlap = (a1: string[], a2: string[]): boolean =>
  a1.filter((mark) => a2.indexOf(mark) >= 0).length === a1.length;
