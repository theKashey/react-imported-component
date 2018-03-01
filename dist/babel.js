'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (_ref) {
  var t = _ref.types,
      template = _ref.template;

  var headerTemplate = template('function importedWrapper(marker, name, realImport) { return realImport;}', templateOptions);

  var importRegistration = template('importedWrapper(MARK, FILE, IMPORT)', templateOptions);

  var importCallRegistration = template('() => importedWrapper(MARK, FILE, IMPORT)', templateOptions);

  var importAwaitRegistration = template('importedWrapper(MARK, FILE, IMPORT)', templateOptions);

  var hasImports = {};
  var visitedNodes = new Map();

  return {
    inherits: _babelPluginSyntaxDynamicImport2.default,

    visitor: {
      Import: function Import(_ref2, _ref3) {
        var parentPath = _ref2.parentPath;
        var file = _ref3.file;

        var localFile = file.opts.filename;
        var newImport = parentPath.node;
        var importName = parentPath.get('arguments')[0].node.value;
        var requiredFile = resolveImport(importName, localFile);

        console.error(parentPath.parentPath.type, importName, requiredFile);

        if (visitedNodes.has(parentPath.node)) {
          return;
        }

        var replace = null;
        if (parentPath.parentPath.type === 'ArrowFunctionExpression') {
          replace = importCallRegistration({
            MARK: t.stringLiteral("imported-component"),
            FILE: t.stringLiteral(requiredFile),
            IMPORT: newImport
          });

          hasImports[localFile] = true;
          visitedNodes.set(newImport, true);

          parentPath.parentPath.replaceWith(replace);
        } else {
          replace = importRegistration({
            MARK: t.stringLiteral("imported-component"),
            FILE: t.stringLiteral(requiredFile),
            IMPORT: newImport
          });

          hasImports[localFile] = true;
          visitedNodes.set(newImport, true);

          parentPath.replaceWith(replace);
        }
      },

      Program: {
        exit: function exit(_ref4, _ref5) {
          var node = _ref4.node;
          var file = _ref5.file;

          if (!hasImports[file.opts.filename]) return;

          // hasImports[file.opts.filename].forEach(cb => cb());
          node.body.unshift(headerTemplate());
        }
      }
    }
  };
};

var _babelPluginSyntaxDynamicImport = require('babel-plugin-syntax-dynamic-import');

var _babelPluginSyntaxDynamicImport2 = _interopRequireDefault(_babelPluginSyntaxDynamicImport);

var _path = require('path');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// this file is 99% babel.js from loadable-components

var resolveImport = function resolveImport(importName, file) {
  if (importName.charAt(0) === '.') {
    return (0, _path.relative)(process.cwd(), (0, _path.resolve)(file, importName));
  }
  return importName;
};

var templateOptions = {
  placeholderPattern: /^([A-Z0-9]+)([A-Z0-9_]+)$/
};