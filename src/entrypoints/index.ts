import { setConfiguration } from '../config';
import { configure, ImportedConfiguration } from '../configuration/configuration';
import {
  assignImportedComponents,
  clearImportedCache,
  done as whenComponentsReady,
  dryRender,
  getLoadable as loadableResource,
} from '../loadable/loadable';
import { loadByChunkname } from '../loadable/loadByChunkName';
import { drainHydrateMarks, printDrainHydrateMarks, rehydrateMarks, waitForMarks } from '../loadable/marks';
import { addPreloader } from '../loadable/preloaders';
import { ImportedComponent } from '../ui/Component';
import { ImportedComponent as ComponentLoader } from '../ui/Component';
import { ImportedStream } from '../ui/context';
import imported, { lazy } from '../ui/HOC';
import LazyBoundary from '../ui/LazyBoundary';
import { ImportedModule, importedModule } from '../ui/Module';
import { useImported, useLazy, useLoadable } from '../ui/useImported';
import { remapImports } from '../utils/helpers';

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
  ImportedComponent,
  ImportedModule,
  loadableResource,
  ImportedStream,
  setConfiguration,
  imported,
  importedModule,
  lazy,
  LazyBoundary,
  remapImports,
  useLoadable,
  useImported,
  useLazy,
  addPreloader,
  clearImportedCache,

  ImportedConfiguration,
  configure,
};
export default imported;
