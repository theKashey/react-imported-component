'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _Component = require('./Component');

var _Component2 = _interopRequireDefault(_Component);

var _loadable = require('./loadable');

var _loadable2 = _interopRequireDefault(_loadable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 *
 * @param {Function} loaderFunction - () => import('a'), or () => require('b')
 * @param {Object} [options]
 * @param {React.Component} [options.LoadingComponent]
 * @param {React.Component} [options.ErrorComponent]
 * @param {Function} [options.exportPicker] - default behaviour - picks default export
 * @param {String} [options.mark] - SSR mark
 */
var loader = function loader(loaderFunction) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  return function (props) {
    return _react2.default.createElement(_Component2.default, _extends({
      ssrMark: options.mark,
      loadable: (0, _loadable2.default)(loaderFunction, true, options.mark),
      LoadingComponent: options.LoadingComponent,
      ErrorComponent: options.ErrorComponent,
      exportPicker: options.exportPicker
    }, props));
  };
};

exports.default = loader;