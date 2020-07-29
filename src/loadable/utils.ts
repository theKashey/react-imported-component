import { settings } from '../configuration/config';

export const toKnownSignature = (signature: string, marks: string[]) =>
  (!settings.checkSignatures && marks.join('|')) || signature;
