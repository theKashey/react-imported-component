'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.encipherImport = undefined;

var _crc = require('crc-32');

var _crc2 = _interopRequireDefault(_crc);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var encipherImport = function encipherImport(string) {
  return _crc2.default.str(string).toString(32);
};

exports.encipherImport = encipherImport;