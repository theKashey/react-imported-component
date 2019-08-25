// pre-import imported component
import './imported-chunk';

// install stream helper
import {injectLoadableTracker} from 'react-imported-component/boot';

injectLoadableTracker('exampleTracker');

// HINT!
// ------------
// CASE 1 - let browser load chunks before going further
// outcome - network and CPU are working together! 👍
// ------------
if(1) {
// load the rest after letting the browser kick off chunk loading
  Promise.resolve().then(() =>
    Promise.resolve().then(() => {
      require('./main')
    })
  );
} else {

// ------------
// CASE 2 - dont do that
// outcome - network is idle while CPU is busy 👎
// ------------

// require('./main')
}



