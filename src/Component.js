import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {AppContainer} from 'react-hot-loader';
import {useMark} from './marks';

const STATE_LOADING = 'loading';
const STATE_ERROR = 'error';
const STATE_OK = 'ok';

export default class HotComponentLoader extends Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentWillMount() {
    useMark(this.props.ssrMark);
    this.reload();
  }

  componentWillReceiveProps() {
    // Hot reload is happening.
    if (module.hot) {
      setImmediate(() => {
        this.props.loadable.reset();
        this.remount()
      });
    }
  }

  remount() {
    if (this.props.loadable.done) {
      this.setState({
        AsyncComponent: this.props.exportPicker(this.props.loadable.payload),
        state: this.props.loadable.ok ? STATE_OK : STATE_ERROR
      });
      return this.props.loadable.promise;
    } else {
      return this.props.loadable.load()
        .then((payload) => {
          this.setState({AsyncComponent: this.props.exportPicker(payload)});
        });
    }
  }

  loader() {
    return Promise.resolve(this.props.loadable());
  }

  reload = () => {
    this.setState({
      state: STATE_LOADING
    });
    this.remount().catch(err => {
      console.error('[React-hot-component-loader]', err);
      this.setState({
        state: STATE_ERROR
      });
    });
  };

  render() {
    const {AsyncComponent, state} = this.state;
    const {LoadingComponent, ErrorComponent} = this.props;

    if (AsyncComponent) {
      return (
        <AppContainer>
          <AsyncComponent {...this.props} />
        </AppContainer>
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
};


const es6import = (module) => (
  module.default
    ? module.default
    : module
);

HotComponentLoader.defaultProps = {
  exportPicker: es6import
};

