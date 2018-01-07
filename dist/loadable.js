'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.dryRender = exports.done = undefined;

var _detectNode = require('detect-node');

var _detectNode2 = _interopRequireDefault(_detectNode);

var _marks = require('./marks');

var _marks2 = _interopRequireDefault(_marks);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var pending = [];

var addPending = function addPending(promise) {
  return pending.push(promise);
};
var removeFromPending = function removeFromPending(promise) {
  return pending = pending.filter(function (a) {
    return a !== promise;
  });
};

var toLoadable = function toLoadable(importFunction) {
  var autoImport = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
  var mark = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

  var _load = function _load() {
    return Promise.resolve().then(importFunction);
  };
  var loadable = {
    importFunction: importFunction,
    done: false,
    ok: false,
    payload: undefined,
    promise: undefined,
    reset: function reset() {
      this.done = false;
      this.ok = true;
      this.payload = undefined;
      this.promise = undefined;
    },
    load: function load() {
      var _this = this;

      if (!this.promise) {
        var promise = this.promise = _load().then(function (payload) {
          _this.done = true;
          _this.ok = true;
          _this.payload = payload;
          removeFromPending(promise);
          return payload;
        }, function (err) {
          _this.done = true;
          _this.ok = false;
          _this.error = err;
          removeFromPending(promise);
          throw err;
        });
        addPending(promise);
      }
      return this.promise;
    }
  };

  if (mark) {
    if (_marks2.default[mark]) {
      if (_detectNode2.default) {
        console.warn('react-deferred-component: mark', mark, 'already used for', _marks2.default[mark].importFunction.toString());
      }
    }
    _marks2.default[mark] = loadable;
  }

  if (_detectNode2.default && autoImport) {
    loadable.load();
  }
  return loadable;
};

var done = exports.done = function done() {
  if (pending.length) {
    return Promise.all(pending).then(function (a) {
      return a[1];
    }).then(done);
  } else {
    return Promise.resolve();
  }
};

var dryRender = exports.dryRender = function dryRender(renderFunction) {
  renderFunction();
  return Promise.resolve().then(done);
};

exports.default = toLoadable;