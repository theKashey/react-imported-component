import imported, {lazy} from './HOC';
import {drainHydrateMarks, printDrainHydrateMarks, rehydrateMarks} from './marks';
import {getLoadable as loadableResource, done as whenComponentsReady, dryRender, assignImportedComponents} from './loadable';
import {ImportedComponent as ComponentLoader} from './Component';
import {ImportedStream} from "./context";
import LazyBoundary from './LazyBoundary'
import {setConfiguration} from './config';

export {
  printDrainHydrateMarks,
  drainHydrateMarks,
  rehydrateMarks,
  whenComponentsReady,
  dryRender,
  assignImportedComponents,

  ComponentLoader,
  loadableResource,

  ImportedStream,
  setConfiguration,

  lazy,
  LazyBoundary,
}
export default imported;