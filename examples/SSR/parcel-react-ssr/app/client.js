// pre-import imported component
import './imported-chunk';

// install stream helper
import {injectLoadableTracker} from 'react-imported-component/boot';

injectLoadableTracker('exampleTracker');

// load the rest after letting the browser kick off chunk loading

Promise.resolve().then(() =>
  Promise.resolve().then(() => {
    require('./main')
  })
);