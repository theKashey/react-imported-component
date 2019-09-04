import imported, {rehydrateMarks, drainHydrateMarks} from 'react-imported-component';
import React from 'react';
import ReactDOM from 'react-dom';
// import chunk definition
import './imported-chunk';

const Component1 = imported(() => import('./splitted-1'));
const Component2 = imported(() => import('./splitted-2'));

function hereTime(prefix) {
  var perfData = window.performance.timing;
  var pageLoadTime = Date.now() - perfData.navigationStart;
  console.log(prefix, pageLoadTime);
}

hereTime('enter');
// wait for all the used marks to load
rehydrateMarks(window.__IMPORTED_COMPONENTS__).then(() => {
  hereTime('start');
  ReactDOM.render(
    <div>
      APP
      <p>
        first component -> <Component1/>
      </p>
      <p>
        second component -> <Component2/>
      </p>
    </div>
    , document.getElementById('app'));
});

// save used marks
window.snapSaveState = () => ({
  "__IMPORTED_COMPONENTS__": drainHydrateMarks(),
});
