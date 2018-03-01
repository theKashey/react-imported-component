/* eslint-disable */ 
    import {assignImportedComponents} from 'react-imported-component';
    const applicationImports = {
      "0": () => import('./HelloWorld2'),
"1": () => import('./HelloWorld3'),
    };
    assignImportedComponents(applicationImports);
    export default applicationImports;