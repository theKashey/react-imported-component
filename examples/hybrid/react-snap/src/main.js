import {rehydrateMarks} from 'react-imported-component/dist/es2015/marks';
import './imported-chunk';
import './app';

function hereTime(prefix) {
  var perfData = window.performance.timing;
  var pageLoadTime = Date.now() - perfData.navigationStart;
  console.log(prefix, pageLoadTime);
}

hereTime('root');

rehydrateMarks(window.__IMPORTED_COMPONENTS__).then(() => hereTime('chunks loaded'));

