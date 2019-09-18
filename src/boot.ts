import {rehydrateMarks} from './marks';
import {done as whenComponentsReady, assignImportedComponents} from './loadable';
import {setConfiguration} from './config';
import {injectLoadableTracker} from './trackers/globalTracker';
import {loadByChunkname} from './loadByChunkName';
import {addPreloader} from "./preloaders";

export {
  rehydrateMarks,
  whenComponentsReady,
  assignImportedComponents,

  loadByChunkname,

  setConfiguration,

  injectLoadableTracker,

  addPreloader,
}