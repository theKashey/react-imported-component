/* eslint-disable */ 
    import {assignImportedComponents} from 'react-imported-component';
    const applicationImports = {
      0: () => import('./components/Another'),
    };
    assignImportedComponents(applicationImports);
    export default applicationImports;