import React from "react";
import { imported, lazy } from "react-imported-component/macro";

const Load = component =>  {
  if (!component) return;
  return imported(component, {
    LoadingComponent: () => <p>Loading</p>,
    ErrorComponent: () => <p>Error</p>
  });
};


export default Load;
