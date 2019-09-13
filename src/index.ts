import imported, {lazy} from './HOC';
import {drainHydrateMarks, printDrainHydrateMarks, rehydrateMarks, waitForMarks} from './marks';
import {
  getLoadable as loadableResource,
  done as whenComponentsReady,
  dryRender,
  assignImportedComponents
} from './loadable';
import {ImportedComponent as ComponentLoader} from './Component';
import {ImportedStream} from "./context";
import LazyBoundary from './LazyBoundary'
import {setConfiguration} from './config';
import {remapImports} from './helpers';

import {useImported, useLoadable, useLazy} from './useImported';
import {loadByChunkname} from './loadByChunkName';

export {
  printDrainHydrateMarks,
  drainHydrateMarks,
  rehydrateMarks,
  waitForMarks,
  whenComponentsReady,
  dryRender,
  assignImportedComponents,

  loadByChunkname,

  ComponentLoader,
  loadableResource,

  ImportedStream,
  setConfiguration,

  lazy,
  LazyBoundary,
  remapImports,

  useLoadable,
  useImported,
  useLazy,
}
export default imported;