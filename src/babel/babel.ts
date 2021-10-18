// @ts-ignore
import { existsSync } from 'fs';
import { dirname, join, relative, resolve } from 'path';

import * as crc32 from 'crc-32';

import { ImportedConfiguration } from '../configuration/configuration';
import { processComment } from './magic-comments';

export const encipherImport = (str: string) => {
  return crc32.str(str).toString(32);
};

// Babel v7 compat
let syntax: any;

try {
  syntax = require('babel-plugin-syntax-dynamic-import');
} catch (err) {
  try {
    syntax = require('@babel/plugin-syntax-dynamic-import');
  } catch (e) {
    throw new Error(
      'react-imported-component babel plugin is requiring `babel-plugin-syntax-dynamic-import` or `@babel/plugin-syntax-dynamic-import` to work. Please add this dependency.'
    );
  }
}

syntax = syntax.default || syntax;

const resolveImport = (importName: string, file = '') => {
  if (importName.charAt(0) === '.') {
    return relative(process.cwd(), resolve(dirname(file), importName));
  }

  return importName;
};

const templateOptions = {
  placeholderPattern: /^([A-Z0-9]+)([A-Z0-9_]+)$/,
};

function getImportArg(callPath: any) {
  return callPath.get('arguments.0');
}

function getComments(callPath: any) {
  return callPath.has('leadingComments') ? callPath.get('leadingComments') : [];
}

// load configuration
const configurationFile = join(process.cwd(), '.imported.js');
const defaultConfiguration: ImportedConfiguration = (
  existsSync(configurationFile) ? require(configurationFile) : {}
) as ImportedConfiguration;

export const createTransformer = (
  { types: t, template }: any,
  excludeMacro = false,
  configuration = defaultConfiguration
) => {
  const headerTemplate = template(
    `var importedWrapper = require('react-imported-component/wrapper');`,
    templateOptions
  );

  const importRegistration = template('importedWrapper(MARK, IMPORT)', templateOptions);

  const hasImports = new Set<string>();
  const visitedNodes = new Map();

  return {
    traverse(programPath: any, fileName: string) {
      let isBootstrapFile = false;

      programPath.traverse({
        ImportDeclaration(path: any) {
          if (excludeMacro) {
            return;
          }

          const source = path.node.source.value;

          if (source === 'react-imported-component/macro') {
            const { specifiers } = path.node;
            path.remove();

            const assignName = 'assignImportedComponents';

            if (specifiers.length === 1 && specifiers[0].imported.name === assignName) {
              isBootstrapFile = true;

              programPath.node.body.unshift(
                t.importDeclaration(
                  [t.importSpecifier(t.identifier(assignName), t.identifier(assignName))],
                  t.stringLiteral('react-imported-component/boot')
                )
              );
            } else {
              programPath.node.body.unshift(
                t.importDeclaration(
                  specifiers.map((spec: any) =>
                    t.importSpecifier(t.identifier(spec.imported.name), t.identifier(spec.imported.name))
                  ),
                  t.stringLiteral('react-imported-component')
                )
              );
            }
          }
        },
        Import({ parentPath }: any) {
          if (visitedNodes.has(parentPath.node)) {
            return;
          }

          const newImport = parentPath.node;
          const rawImport = getImportArg(parentPath);
          const importName = rawImport.node.value;
          const rawComments = getComments(rawImport);
          const comments = rawComments.map((parent: any) => parent.node.value);

          const newComments = processComment(configuration, comments, importName, fileName, {
            isBootstrapFile,
          });

          if (newComments !== comments) {
            rawComments.forEach((comment: any) => comment.remove());

            newComments.forEach((comment: string) => {
              rawImport.addComment('leading', ` ${comment} `);
            });
          }

          if (!importName) {
            return;
          }

          const requiredFileHash = encipherImport(resolveImport(importName, fileName));

          let replace = null;

          replace = importRegistration({
            MARK: t.stringLiteral(`imported_${requiredFileHash}_component`),
            IMPORT: newImport,
          });

          hasImports.add(fileName);
          visitedNodes.set(newImport, true);

          parentPath.replaceWith(replace);
        },
      });
    },

    finish(node: any, filename: string) {
      if (!hasImports.has(filename)) {
        return;
      }

      node.body.unshift(headerTemplate());
    },

    hasImports,
  };
};

export const babelPlugin = (babel: any, options: ImportedConfiguration = {}) => {
  const transformer = createTransformer(babel, false, {
    ...defaultConfiguration,
    ...options,
  });

  return {
    inherits: syntax,

    visitor: {
      Program: {
        enter(programPath: any, { file }: any) {
          transformer.traverse(programPath, file.opts.filename);
        },

        exit({ node }: any, { file }: any) {
          transformer.finish(node, file.opts.filename);
        },
      },
    },
  };
};
