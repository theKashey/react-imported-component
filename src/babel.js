import syntax from 'babel-plugin-syntax-dynamic-import'
import {resolve, relative, dirname} from 'path';
import {encipherImport} from './utils';

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
  const headerTemplate = template(
    'function importedWrapper(marker, name, realImport) { return realImport;}',
    templateOptions,
  );

  const importRegistration = template(
    'importedWrapper(MARK, FILE, IMPORT)',
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
              const requiredFile = encipherImport(resolveImport(importName, localFile));

              let replace = null;

              replace = importRegistration({
                MARK: t.stringLiteral("imported-component"),
                FILE: t.stringLiteral(requiredFile),
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