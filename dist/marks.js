"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var LOADABLE_MARKS = {};
var USED_MARKS = {};

var useMark = exports.useMark = function useMark(a) {
  if (a) {
    USED_MARKS[a] = true;
  }
};

var rehydrateMarks = exports.rehydrateMarks = function rehydrateMarks() {
  var marks = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

  var rehydrate = marks || global.___REACT_DEFERRED_COMPONENT_MARKS || [];
  return Promise.all(rehydrate.map(function (mark) {
    return LOADABLE_MARKS[mark];
  }).filter(function (it) {
    return !!it;
  }).map(function (loadable) {
    return loadable.load();
  }));
};

var drainHydrateMarks = exports.drainHydrateMarks = function drainHydrateMarks() {
  var used = Object.keys(USED_MARKS);
  USED_MARKS = {};
  return used;
};

var printDrainHydrateMarks = exports.printDrainHydrateMarks = function printDrainHydrateMarks() {
  return "<script>window.___REACT_DEFERRED_COMPONENT_MARKS=" + JSON.stringify(drainHydrateMarks()) + "</script>";
};

exports.default = LOADABLE_MARKS;