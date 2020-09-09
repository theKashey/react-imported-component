import { settings } from '../configuration/config';
import { Promised } from '../types';
import { assignMetaData } from './metadata';
import { done } from './pending';
import { LOADABLE_SIGNATURE } from './registry';
import { toLoadable } from './toLoadable';

type ImportedDefinition = [Promised<any>, string, string, boolean];
/**
 * to be used __only via CLI tools__
 */
export const assignImportedComponents = (set: ImportedDefinition[]) => {
  const countBefore = LOADABLE_SIGNATURE.size;
  set.forEach(imported => {
    const allowAutoLoad = !(imported[3] || !settings.fileFilter(imported[2]));
    const loadable = toLoadable(imported[0], allowAutoLoad);
    assignMetaData(loadable.mark, loadable, imported[1], imported[2]);
  });

  if (countBefore === LOADABLE_SIGNATURE.size) {
    // tslint:disable-next-line:no-console
    console.error('react-imported-component: no import-marks found, please check babel plugin');
  }

  done();

  return set;
};
