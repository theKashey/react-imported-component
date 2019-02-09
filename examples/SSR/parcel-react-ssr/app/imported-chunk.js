
    /* eslint-disable */
    /* tslint:disable */
     
    import {assignImportedComponents} from 'react-imported-component';
    
    const applicationImports = [
      () => import('./HelloWorld2'),
      () => import('./HelloWorld3'),
    ];
    
    assignImportedComponents(applicationImports);
    export default applicationImports;