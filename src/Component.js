import React, {Component} from 'react';
import PropTypes from 'prop-types';
import isNode from 'detect-node';
import {useMark} from './marks';
import NotSoPureComponent from "./NotSoPureComponent";
import toLoadable from "./loadable";

const STATE_LOADING = 'loading';
const STATE_ERROR = 'error';
const STATE_DONE = 'done';

const FragmentNode = ({children}) => <div>{children}</div>;
FragmentNode.propTypes = {
  children: PropTypes.any
};
const Fragment = React.Fragment ? React.Fragment : FragmentNode;

export const settings = {
  hot: !!module.hot,
  SSR: true
};

const getLoadable = importFunction => {
  if ('promise' in importFunction) {
    return importFunction;
  }
  return toLoadable(importFunction, false);
}

class ReactImportedComponent extends Component {

  mounted = false;mounted

  constructor(props) {
    super(props);
    this.state = this.pickPrecached() || {};

    if (isNode && settings.SSR) {
      useMark(this.props.loadable.mark);
      if (this.state.state !== STATE_DONE) {
        this.reload();
      }
    }
  }

  componentDidMount() {
    this.mounted =true;
    useMark(this.props.loadable.mark);
    if (this.state.state !== STATE_DONE) {
      this.reload();
    }
  }

  componentWillUnmount(){
    this.mounted = false;
  }

  pickPrecached() {
    const loadable = getLoadable(this.props.loadable);
    if (loadable.done) {
      return {
        AsyncComponent: this.props.exportPicker(loadable.payload),
        state: loadable.ok ? STATE_DONE : STATE_ERROR
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
      return loadable.load()
        .then((payload) => {
          if(this.mounted) {
            this.setState({AsyncComponent: this.props.exportPicker(payload)});
          }
        });
    }
  }

  remount() {
    this.loadAsyncComponent().catch(err => {
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

  fragmentedRender(payload) {
    if (settings.hot) {
      return (
        <Fragment>
          {payload}
          <NotSoPureComponent onUpdate={this.onHRM}/>
        </Fragment>
      );
    }
    return payload;
  }

  render() {
    const {AsyncComponent, state} = this.state;
    const {LoadingComponent, ErrorComponent} = this.props;

    if (this.props.render) {
      return this.fragmentedRender(this.props.render(AsyncComponent, state, this.props))
    }

    if (AsyncComponent) {
      return this.fragmentedRender(<AsyncComponent {...this.props} />)
    }

    switch (state) {
      case STATE_LOADING:
        return LoadingComponent
          ? React.Children.only(<LoadingComponent {...this.props} />)
          : null;
      case STATE_ERROR:
        return ErrorComponent
          ? React.Children.only(<ErrorComponent retryImport={this.reload} error={this.state.error} {...this.props} />)
          : null;
      default:
        return null;
    }
  }
}

ReactImportedComponent.propTypes = {
  loadable: PropTypes.object.isRequired,
  LoadingComponent: PropTypes.func,
  ErrorComponent: PropTypes.func,
  exportPicker: PropTypes.func,
  render: PropTypes.func,
  ssrMark: PropTypes.string,

  onError: PropTypes.func
};


const es6import = (module) => (
  module.default
    ? module.default
    : module
);

ReactImportedComponent.defaultProps = {
  exportPicker: es6import
};


export default ReactImportedComponent;