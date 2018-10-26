import imported, {lazy}  from './HOC';
import {drainHydrateMarks, printDrainHydrateMarks, rehydrateMarks} from './marks';
import loadableResource, {done as whenComponentsReady, dryRender, assignImportedComponents} from './loadable';
import ComponentLoader, {settings} from './Component';
import {ImportedStream} from "./context";

const setConfiguration = (config) => Object.assign(settings, config);

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

  lazy
}
export default imported;