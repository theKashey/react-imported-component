import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { useMark } from './marks';
import toLoadable from "./loadable";
import { UIDConsumer } from "./context";

const isBrowser = (typeof window !== 'undefined');
const STATE_LOADING = 'loading';
const STATE_ERROR = 'error';
const STATE_DONE = 'done';

const FragmentNode = ({ children }) => <div>{children}</div>;
FragmentNode.propTypes = {
  children: PropTypes.any
};

export const settings = {
  hot: !!module.hot,
  SSR: !isBrowser
};

const getLoadable = importFunction => {
  if ('promise' in importFunction) {
    return importFunction;
  }
  return toLoadable(importFunction, false);
};

export class UnconnectedReactImportedComponent extends Component {

  mounted = false;

  constructor(props) {
    super(props);
    this.state = this.pickPrecached() || {};

    const loadable = getLoadable(this.props.loadable);
    loadable.load().catch(() => ({}));
    this.state.mark = loadable.mark;

    if (!isBrowser && settings.SSR && typeof this.props.streamId !== 'undefined') {
      useMark(this.props.streamId, loadable.mark);
      if (this.state.state !== STATE_DONE) {
        this.state.state = STATE_LOADING;
        this.reload();
      }
    }
  }

  componentDidMount() {
    this.mounted = true;
    useMark(this.props.streamId, this.state.mark);
    if (this.state.state !== STATE_DONE) {
      this.reload();
    }
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  componentDidUpdate(oldProps) {
    // this.props.loadable would change only on HRM (or direct component usage)
    // just load it, do not use result
    if (oldProps.loadable !== this.props.loadable) {
      getLoadable(this.props.loadable).load().catch(() => ({}));
    }
  }

  pickPrecached() {
    const loadable = getLoadable(this.props.loadable);
    if (loadable.done) {
      return {
        AsyncComponent: this.props.exportPicker(loadable.payload),
        state: loadable.ok ? STATE_DONE : STATE_ERROR,
        error: loadable.error,
      };
    }
    return null;
  }

  loadAsyncComponent() {
    const loadable = getLoadable(this.props.loadable);
    if (loadable.done) {
      this.setState(this.pickPrecached());
      return loadable.promise;
    } else {
      this.loadingPromise = loadable.load();
      return this.loadingPromise.then((payload) => {
        if (this.mounted) {
          this.setState({
            AsyncComponent: this.props.exportPicker(payload),
            state: STATE_DONE
          });
        }
      });
    }
  }

  remount() {
    this.loadAsyncComponent().catch(err => {
      if (this.mounted) {
        /* eslint-disable */
        console.error('[React-imported-component]', err);
        /* eslint-enable */
        this.setState({
          state: STATE_ERROR,
          error: err
        });

        if (this.props.onError) {
          this.props.onError(err);
        } else {
          throw err;
        }
      }
    });
  }

  reload = () => {
    if (this.mounted) {
      this.setState({
        state: STATE_LOADING
      });
    }
    this.remount();
  };

  render() {
    const { AsyncComponent, state } = this.state;
    const { LoadingComponent, ErrorComponent } = this.props;

    if (state === STATE_LOADING && this.props.async) {
      throw this.loadingPromise;
    }

    if (this.props.render) {
      return this.props.render(AsyncComponent, state, this.props.forwardProps)
    }

    if (AsyncComponent) {
      return <AsyncComponent {...this.props.forwardProps} ref={this.props.forwardRef} />
    }

    switch (state) {
      case STATE_LOADING:
        return LoadingComponent
          ? React.Children.only(<LoadingComponent {...this.props.forwardProps} />)
          : null;
      case STATE_ERROR:
        if (ErrorComponent) {
          return React.Children.only(<ErrorComponent
            retryImport={this.reload}
            error={this.state.error}
            {...this.props.forwardProps}
          />)
        }
        throw this.state.error;
      default:
        return null;
    }
  }
}

const es6import = (module) => (
  module.default
    ? module.default
    : module
);

const BaseProps = {
  loadable: PropTypes.oneOfType([PropTypes.object, PropTypes.func]).isRequired,
  LoadingComponent: PropTypes.func,
  ErrorComponent: PropTypes.func,
  exportPicker: PropTypes.func,
  render: PropTypes.func,
  ssrMark: PropTypes.string,
  async: PropTypes.bool,

  onError: PropTypes.func,
  forwardProps: PropTypes.object,
  forwardRef: PropTypes.func,
};

UnconnectedReactImportedComponent.propTypes = {
  ...BaseProps,
  streamId: PropTypes.number
};

UnconnectedReactImportedComponent.defaultProps = {
  exportPicker: es6import,
  async: false
};

const ReactImportedComponent = (props) => (
  settings.SSR
    ? <UIDConsumer>{UID => <UnconnectedReactImportedComponent {...props} streamId={UID | 0} />}</UIDConsumer>
    : <UnconnectedReactImportedComponent {...props} streamId={0} />
);

ReactImportedComponent.propTypes = BaseProps;

export default ReactImportedComponent;