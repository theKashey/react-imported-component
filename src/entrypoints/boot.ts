import { setConfiguration } from '../configuration/config';
import { assignImportedComponents } from '../loadable/assignImportedComponents';
import { loadByChunkname } from '../loadable/loadByChunkName';
import { rehydrateMarks } from '../loadable/marks';
import { done as whenComponentsReady } from '../loadable/pending';
import { addPreloader } from '../loadable/preloaders';
import { injectLoadableTracker } from '../trackers/globalTracker';

export {
  rehydrateMarks,
  whenComponentsReady,
  assignImportedComponents,
  loadByChunkname,
  setConfiguration,
  injectLoadableTracker,
  addPreloader,
};
