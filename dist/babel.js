'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (_ref) {
  var t = _ref.types;

  return {
    inherits: _babelPluginSyntaxDynamicImport2.default,

    visitor: {
      ImportDeclaration: function ImportDeclaration(path, file) {
        var source = path.node.source.value;
        if (source !== 'react-imported-component') return;

        var defaultSpecifier = path.get('specifiers').find(function (specifier) {
          return specifier.isImportDefaultSpecifier();
        });

        if (!defaultSpecifier) return;

        var bindingName = defaultSpecifier.node.local.name;
        var binding = path.scope.getBinding(bindingName);

        binding.referencePaths.forEach(function (refPath) {
          var callExpression = refPath.parentPath;

          if (callExpression.isMemberExpression() && callExpression.node.computed === false && callExpression.get('property').isIdentifier({ name: 'Map' })) {
            callExpression = callExpression.parentPath;
          }

          if (!callExpression.isCallExpression()) return;

          var args = callExpression.get('arguments');
          var loaderMethod = args[0];

          if (!loaderMethod) return;

          var dynamicImports = [];

          loaderMethod.traverse({
            Import: function Import(_ref2) {
              var parentPath = _ref2.parentPath;

              dynamicImports.push(parentPath);
            }
          });

          if (!dynamicImports.length) return;

          var options = args[1];
          if (args[1]) {
            options = options.node;
          } else {
            options = t.objectExpression([]);
            callExpression.node.arguments.push(options);
          }

          console.log(dynamicImport);

          options.properties.push(t.objectProperty(t.identifier('mark'), t.stringLiteral(dynamicImports.map(function (dynamicImport) {
            return dynamicImport.get('arguments')[0].node;
          }).join('-') + file.opts.filename)));
        });
      }
    }
  };
};

var _babelPluginSyntaxDynamicImport = require('babel-plugin-syntax-dynamic-import');

var _babelPluginSyntaxDynamicImport2 = _interopRequireDefault(_babelPluginSyntaxDynamicImport);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }