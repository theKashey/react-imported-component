/* eslint-disable */ 
    import {assignImportedComponents} from 'react-imported-component';
    const applicationImports = {
      0: () => import('./components/Another'),
1: () => import(/* webpackChunkName: "namedChunk-1" */'./components/Other'),
2: () => import(/* webpackChunkName: "namedChunk-1" */'./components/OtherTween'),
    };
    assignImportedComponents(applicationImports);
    export default applicationImports;