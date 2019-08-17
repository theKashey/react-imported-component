import * as React from 'react';
import {ComponentOptions} from "./types";
import {useImported} from "./useImported";

export function ImportedComponent<P, K>(props: ComponentOptions<P, K>) {

  const {loading, error, loadable, component: Component, retry} = useImported(props.importer);

  if (loading && props.async) {
    throw loadable.resolution;
  }

  if ('render' in props) {
    return props.render(Component, {loading, error}, props.forwardProps)
  }

  if (Component) {
    return <Component {...props.forwardProps} ref={props.forwardRef}/>
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
}