import { setConfiguration } from '../config';
import { assignImportedComponents, done as whenComponentsReady } from '../loadable/loadable';
import { loadByChunkname } from '../loadable/loadByChunkName';
import { rehydrateMarks } from '../loadable/marks';
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
