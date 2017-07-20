import React, {Component, PropTypes} from 'react';
import { AppContainer } from 'react-hot-loader';

const STATE_LOADING = 'loading';
const STATE_ERROR = 'error';
const STATE_OK = 'ok';

export class HotComponentLoader extends Component {

  constructor(props){
    super(props);
    this.state = {};
    this.reload = this.reload.bind(this);
  }

  componentWillMount() {
    this.reload();
  }

  componentWillReceiveProps() {
    // Hot reload is happening.
    if (module.hot) {
      this.remount();
    }
  }

  remount() {
    this.loader()
      .then((payload) => {
        this.setState({AsyncComponent: this.props.exportPicker(payload)});
      });
  }

  loader() {
    return Promise.resolve(this.props.loader());
  }

  reload() {
    this.setState({
      state: STATE_LOADING
    });
    this.loader().then((payload) => {
      this.setState({
        AsyncComponent: this.props.exportPicker(payload),
        state: STATE_OK
      });
    }, (err) => {
      console.error('[React-hot-component-loader]', err);
      this.setState({
        state: STATE_ERROR
      });
    });
  }

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
  loader: PropTypes.func.isRequired,
  LoadingComponent: PropTypes.func,
  ErrorComponent: PropTypes.func,
  exportPicker: PropTypes.func
};


const es6import = (module) => (
  module.default
    ? module.default
    : module
);

HotComponentLoader.defaultProps = {
  exportPicker: es6import
};

const loader = (loaderFunction, options) => {
  const hotLoader = (props) => (
    <AsyncComponentLoader
      loader={loaderFunction}
      LoadingComponent={options.LoadingComponent}
      ErrorComponent={options.ErrorComponent}
      exportPicker={options.exportPicker}
      {...props}
    />
  );
  hotLoader.propTypes = {
    loader: PropTypes.func.isRequired,
    LoadingComponent: PropTypes.func,
    ErrorComponent: PropTypes.func,
    exportPicker: PropTypes.func
  };
  return hotLoader;
};

export default loader;