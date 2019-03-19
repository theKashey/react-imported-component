
    /* eslint-disable */
    /* tslint:disable */
     
    import {assignImportedComponents} from 'react-imported-component';
    
    const applicationImports = [
      () => import('./splitted-1'),
      () => import('./splitted-2'),
      () => import('./splitted-3'),
    ];
    
    assignImportedComponents(applicationImports);
    export default applicationImports;