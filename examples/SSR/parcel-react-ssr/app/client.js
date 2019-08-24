// pre-import imported component
import './imported-chunk';

// install stream helper
import {injectLoadableTracker} from 'react-imported-component/boot';

injectLoadableTracker('exampleTracker');

// load the rest
Promise.resolve().then(() => require('./main'));