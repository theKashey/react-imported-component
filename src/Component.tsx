import * as React from 'react';
import {ReactElement} from "react";
import {uid} from "react-uid";

import {ComponentOptions} from "./types";
import {useImported} from "./useImported";


function ImportedComponent<P, K>(props: ComponentOptions<P, K>): ReactElement | null {
  const {loading, error, loadable, imported: Component, retry} = useImported(props.loadable);

  if (loading && props.async) {
    throw loadable.resolution;
  }

  if ('render' in props && props.render) {
    return props.render(Component, {loading, error}, props.forwardProps)
  }

  if (Component) {
    // importedUUID for cache busting
    return <Component {...props.forwardProps} ref={props.forwardRef} importedUUID={uid(Component)}/>
  }

  if (loading) {
    return props.LoadingComponent
      ? <props.LoadingComponent {...props.forwardProps} />
      : null;
  }

  if (error) {
    if (props.ErrorComponent) {
      return (
        <props.ErrorComponent
          retryImport={retry}
          error={error}
          {...props.forwardProps}
        />
      )
    }
    throw error;
  }

  return null;
};

export {
  ImportedComponent
}