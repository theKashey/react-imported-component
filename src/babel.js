import {resolve, relative, dirname} from 'path';
import {encipherImport} from './utils';

// Babel v7 compat
let syntax
try {
  syntax = require('babel-plugin-syntax-dynamic-import');
} catch (err) {
  try {
    syntax = require('@babel/plugin-syntax-dynamic-import');
  } catch (e) {
    throw new Error('react-imported-component babel plugin is requiring `babel-plugin-syntax-dynamic-import` or `@babel/plugin-syntax-dynamic-import` to work. Please add this dependency.')
  }
}
syntax = syntax.default || syntax

const resolveImport = (importName, file) => {
  if (importName.charAt(0) === '.') {
    return relative(process.cwd(), resolve(dirname(file), importName));
  }
  return importName;
};

const templateOptions = {
  placeholderPattern: /^([A-Z0-9]+)([A-Z0-9_]+)$/,
};

export default function ({types: t, template}) {
  var headerTemplate = template(`function importedWrapper(marker, realImport) { 
      if (typeof __deoptimization_sideEffect__ !== 'undefined') {
        __deoptimization_sideEffect__(marker, realImport);
      }
      return realImport;
  }`, templateOptions);

  const importRegistration = template(
    'importedWrapper(MARK, IMPORT)',
    templateOptions,
  );

  const hasImports = {};
  const visitedNodes = new Map();

  return {
    inherits: syntax,

    visitor: {
      // using program to replace imports before "dynamic-import-node"
      // see: https://jamie.build/babel-plugin-ordering.html
      Program: {
        enter(programPath, {file}) {
          programPath.traverse({
            Import({parentPath}) {
              if (visitedNodes.has(parentPath.node)) {
                return;
              }

              const localFile = file.opts.filename;
              const newImport = parentPath.node;
              const importName = parentPath.get('arguments')[0].node.value;
              if (!importName) {
                return;
              }
              const requiredFileHash = encipherImport(resolveImport(importName, localFile));

              let replace = null;

              replace = importRegistration({
                MARK: t.stringLiteral(`imported_${requiredFileHash}_component`),
                IMPORT: newImport
              });

              hasImports[localFile] = true;
              visitedNodes.set(newImport, true);

              parentPath.replaceWith(replace);
            }
          });
        },

        exit({node}, {file}) {
          if (!hasImports[file.opts.filename]) return;

          // hasImports[file.opts.filename].forEach(cb => cb());
          node.body.unshift(headerTemplate());

        }
      },
    }
  }
}
