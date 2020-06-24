// @ts-ignore
import * as crc32 from 'crc-32';
import { existsSync } from 'fs';
import { dirname, join, relative, resolve } from 'path';
import vm from 'vm';

import { ImportedConfiguration } from '../configuration/configuration';
import { CLIENT_SIDE_ONLY } from '../configuration/constants';

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

const Nope = () => false as any;
// load configuration
const configurationFile = join(process.cwd(), '.imported.js');
const defaultConfiguration: ImportedConfiguration = (existsSync(configurationFile)
  ? require(configurationFile)
  : {}) as ImportedConfiguration;

const processComment = (
  configuration: ImportedConfiguration,
  comments: string[],
  importName: string,
  fileName: string,
  options: {
    isBootstrapFile: boolean;
  }
): string[] => {
  const { shouldPrefetch = Nope, shouldPreload = Nope, chunkName = Nope } = configuration;
  const chunkComment = (chunk: string) => ` webpackChunkName: "${chunk}" `;
  const preloadComment = () => ` webpackPreload: true `;
  const prefetchComment = () => ` webpackPrefetch: true `;

  const parseMagicComments = (str: string): object => {
    if (str.trim() === CLIENT_SIDE_ONLY) {
      return {};
    }
    try {
      const values = vm.runInNewContext(`(function(){return {${str}};})()`);
      return values;
    } catch (e) {
      return {};
    }
  };

  const importConfiguration = comments.reduce(
    (acc, comment) => ({
      ...acc,
      ...parseMagicComments(comment),
    }),
    {} as any
  );

  const newChunkName = chunkName(importName, fileName, importConfiguration);
  const { isBootstrapFile } = options;
  return [
    ...comments,
    !isBootstrapFile && shouldPrefetch(importName, fileName, importConfiguration) ? prefetchComment() : '',
    !isBootstrapFile && shouldPreload(importName, fileName, importConfiguration) ? preloadComment() : '',
    newChunkName ? chunkComment(newChunkName) : '',
  ].filter(x => !!x);
};

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

  let isBootstrapFile = false;

  return {
    traverse(programPath: any, fileName: string) {
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
              rawImport.addComment('leading', comment);
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

export default function(babel: any, options: ImportedConfiguration = {}) {
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
}
