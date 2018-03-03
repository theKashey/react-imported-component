import React, {Component} from 'react';
import PropTypes from 'prop-types';
import isNode from 'detect-node';
import {useMark} from './marks';
import NotSoPureComponent from "./NotSoPureComponent";
import toLoadable from "./loadable";

const STATE_LOADING = 'loading';
const STATE_ERROR = 'error';
const STATE_OK = 'ok';

const Fragment = React.Fragment ? React.Fragment : ({children}) => <div>{children}</div>;

export const settings = {
  hot: !!module.hot
};

const getLoadable = importFunction => {
  if ('promise' in importFunction) {
    return importFunction;
  }
  return toLoadable(importFunction, false);
}

export default class HotComponentLoader extends Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentWillMount() {
    // SSR support
    useMark(this.props.loadable.mark);
    if (isNode) {
      this.reload();
    }
  }

  componentDidMount() {
    useMark(this.props.loadable.mark);
    this.reload();
  }

  loadAsyncComponent() {
    const loadable = getLoadable(this.props.loadable)
    if (loadable.done) {
      this.setState({
        AsyncComponent: this.props.exportPicker(loadable.payload),
        state: loadable.ok ? STATE_OK : STATE_ERROR
      });
      return loadable.promise;
    } else {
      return loadable.load()
        .then((payload) => {
          this.setState({AsyncComponent: this.props.exportPicker(payload)});
        });
    }
  }

  remount() {
    this.loadAsyncComponent().catch(err => {
      /* eslint-disable */
      console.error('[React-imported-component]', err);
      /* eslint-enable */
      this.setState({
        state: STATE_ERROR
      });
      if (this.props.onError) {
        this.props.onError(err);
      } else {
        throw err;
      }
    });
  }

  onHRM = () => {
    if (settings.hot) {
      setImmediate(() => {
        this.props.loadable.reset();
        this.remount()
      });
    }
  };

  reload = () => {
    this.setState({
      state: STATE_LOADING
    });
    this.remount();
  };

  render() {
    const {AsyncComponent, state} = this.state;
    const {LoadingComponent, ErrorComponent} = this.props;

    if (AsyncComponent) {
      return (
        <Fragment>
          <AsyncComponent {...this.props} />
          <NotSoPureComponent onUpdate={this.onHRM}/>
        </Fragment>
      );
    }

    switch (state) {
      case STATE_LOADING:
        return LoadingComponent
          ? React.Children.only(<LoadingComponent {...this.props} />)
          : null;
      case STATE_ERROR:
        return ErrorComponent
          ? React.Children.only(<ErrorComponent retryImport={this.reload} {...this.props} />)
          : null;
      default:
        return null;
    }
  }
}

HotComponentLoader.propTypes = {
  loadable: PropTypes.object.isRequired,
  LoadingComponent: PropTypes.func,
  ErrorComponent: PropTypes.func,
  exportPicker: PropTypes.func,
  ssrMark: PropTypes.string,

  onError: PropTypes.func
};


const es6import = (module) => (
  module.default
    ? module.default
    : module
);

HotComponentLoader.defaultProps = {
  exportPicker: es6import
};

