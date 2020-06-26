import * as React from 'react';
import { ReactElement } from 'react';

import { settings } from '../config';
import { ComponentOptions } from '../types';
import { useImported } from './useImported';

/**
 * @deprecated use {@link useImported} instead
 */
function ImportedComponent<P, K>(props: ComponentOptions<P, K>): ReactElement | null {
  const { loading, error, loadable, imported: Component, retry } = useImported(props.loadable);

  if (loading && props.async) {
    throw loadable.resolution;
  }

  if ('render' in props && props.render) {
    return props.render(Component, { loading, error }, props.forwardProps);
  }

  if (Component) {
    // importedUUID for cache busting
    return <Component {...props.forwardProps} ref={props.forwardRef} />;
  }

  if (loading) {
    if (props.async) {
      throw loadable.resolution;
    }
    return props.LoadingComponent ? <props.LoadingComponent {...props.forwardProps} /> : null;
  }

  if (error) {
    // always report errors
    // tslint:disable-next-line:no-console
    console.error('react-imported-component', error);
    // let's rethrow the error after react leaves this function
    // this might be very crucial for the "safe" dev mode
    if (settings.rethrowErrors) {
      setTimeout(() => {
        throw error;
      });
    }
    if (props.ErrorComponent) {
      return <props.ErrorComponent retryImport={retry} error={error} {...props.forwardProps} />;
    }
    throw error;
  }

  return null;
}

export { ImportedComponent };
