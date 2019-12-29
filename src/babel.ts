// @ts-ignore
import * as crc32 from 'crc-32';
import { dirname, relative, resolve } from 'path';

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

export const createTransformer = ({ types: t, template }: any, excludeMacro = false) => {
  const headerTemplate = template(
    `var importedWrapper = require('react-imported-component/wrapper');`,
    templateOptions
  );

  const importRegistration = template('importedWrapper(MARK, IMPORT)', templateOptions);

  const hasImports = new Set<string>();
  const visitedNodes = new Map();

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
          const importName = parentPath.get('arguments')[0].node.value;

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
      if (!hasImports.has(filename)) { return; }
      node.body.unshift(headerTemplate());
    },

    hasImports,
  };
};

export default function(babel: any) {
  const transformer = createTransformer(babel);

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
