
    /* eslint-disable */
    /* tslint:disable */
     
    import {assignImportedComponents} from 'react-imported-component/boot';
    
    const applicationImports = [
      () => import('./HelloWorld2'),
      () => import('./HelloWorld3'),
    ];
    
    assignImportedComponents(applicationImports);
    export default applicationImports;