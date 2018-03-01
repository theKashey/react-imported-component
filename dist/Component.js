'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.settings = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _detectNode = require('detect-node');

var _detectNode2 = _interopRequireDefault(_detectNode);

var _marks = require('./marks');

var _NotSoPureComponent = require('./NotSoPureComponent');

var _NotSoPureComponent2 = _interopRequireDefault(_NotSoPureComponent);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var STATE_LOADING = 'loading';
var STATE_ERROR = 'error';
var STATE_OK = 'ok';

var Fragment = _react2.default.Fragment ? _react2.default.Fragment : function (_ref) {
  var children = _ref.children;
  return _react2.default.createElement(
    'div',
    null,
    children
  );
};

var settings = exports.settings = {
  hot: !!module.hot
};

var HotComponentLoader = function (_Component) {
  _inherits(HotComponentLoader, _Component);

  function HotComponentLoader(props) {
    _classCallCheck(this, HotComponentLoader);

    var _this = _possibleConstructorReturn(this, (HotComponentLoader.__proto__ || Object.getPrototypeOf(HotComponentLoader)).call(this, props));

    _this.onHRM = function () {
      if (settings.hot) {
        setImmediate(function () {
          _this.props.loadable.reset();
          _this.remount();
        });
      }
    };

    _this.reload = function () {
      _this.setState({
        state: STATE_LOADING
      });
      _this.remount();
    };

    _this.state = {};
    return _this;
  }

  _createClass(HotComponentLoader, [{
    key: 'componentWillMount',
    value: function componentWillMount() {
      // SSR support
      (0, _marks.useMark)(this.props.loadable.mark);
      if (_detectNode2.default) {
        this.reload();
      }
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      (0, _marks.useMark)(this.props.loadable.mark);
      this.reload();
    }
  }, {
    key: 'loadAsyncComponent',
    value: function loadAsyncComponent() {
      var _this2 = this;

      if (this.props.loadable.done) {
        this.setState({
          AsyncComponent: this.props.exportPicker(this.props.loadable.payload),
          state: this.props.loadable.ok ? STATE_OK : STATE_ERROR
        });
        return this.props.loadable.promise;
      } else {
        return this.props.loadable.load().then(function (payload) {
          _this2.setState({ AsyncComponent: _this2.props.exportPicker(payload) });
        });
      }
    }
  }, {
    key: 'remount',
    value: function remount() {
      var _this3 = this;

      this.loadAsyncComponent().catch(function (err) {
        /* eslint-disable */
        console.error('[React-imported-component]', err);
        /* eslint-enable */
        _this3.setState({
          state: STATE_ERROR
        });
        if (_this3.props.onError) {
          _this3.props.onError(err);
        } else {
          throw err;
        }
      });
    }
  }, {
    key: 'loader',
    value: function loader() {
      return Promise.resolve(this.props.loadable());
    }
  }, {
    key: 'render',
    value: function render() {
      var _state = this.state,
          AsyncComponent = _state.AsyncComponent,
          state = _state.state;
      var _props = this.props,
          LoadingComponent = _props.LoadingComponent,
          ErrorComponent = _props.ErrorComponent;


      if (AsyncComponent) {
        return _react2.default.createElement(
          Fragment,
          null,
          _react2.default.createElement(AsyncComponent, this.props),
          _react2.default.createElement(_NotSoPureComponent2.default, { onUpdate: this.onHRM })
        );
      }

      switch (state) {
        case STATE_LOADING:
          return LoadingComponent ? _react2.default.Children.only(_react2.default.createElement(LoadingComponent, this.props)) : null;
        case STATE_ERROR:
          return ErrorComponent ? _react2.default.Children.only(_react2.default.createElement(ErrorComponent, _extends({ retryImport: this.reload }, this.props))) : null;
        default:
          return null;
      }
    }
  }]);

  return HotComponentLoader;
}(_react.Component);

exports.default = HotComponentLoader;


HotComponentLoader.propTypes = {
  loadable: _propTypes2.default.object.isRequired,
  LoadingComponent: _propTypes2.default.func,
  ErrorComponent: _propTypes2.default.func,
  exportPicker: _propTypes2.default.func,
  ssrMark: _propTypes2.default.string,

  onError: _propTypes2.default.func
};

var es6import = function es6import(module) {
  return module.default ? module.default : module;
};

HotComponentLoader.defaultProps = {
  exportPicker: es6import
};