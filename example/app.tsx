import * as React from "react";

import imported, {lazy, LazyBoundary} from "../src";

const deferImport = (promise: Promise<any>) => new Promise(resolve => setTimeout(() => resolve(promise), 2000));

const Lazy = () => <div>I AM LAZY</div>;


const ReactLazy = React.lazy(() => deferImport({default: Lazy}));
const ImportedLazy = lazy(() => deferImport({default: Lazy}));
const Imported = imported(() => deferImport({default: Lazy}));
const ImportedLoading = imported(() => deferImport({default: Lazy}), { LoadingComponent: () => "imported is loading"});

function App() {
  return (
    <div className="App">
      <h1>Lazy Loading</h1>
      <ul>
        <li>
          <React.Suspense fallback={<div>Loading (React)</div>}>
            <ReactLazy/>
          </React.Suspense>
        </li>
        <li>
          <LazyBoundary fallback={<div>Loading (Imported)</div>}>
            <ImportedLazy/>
          </LazyBoundary>
        </li>
        <li>
            <Imported/>
        </li>
        <li>
            <ImportedLoading/>
        </li>
      </ul>
    </div>
  );
}

export default App;