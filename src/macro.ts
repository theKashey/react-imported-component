// @ts-ignore
import {createMacro} from "babel-plugin-macros";
import {createTransformer} from "./babel"
import {assignImportedComponents} from './loadable'

function getMacroType(tagName: string) {
  switch (tagName) {
    case "imported":
    case "lazy":
    case "useImported":
      return "react-imported-component";
    case "assignImportedComponents":
      return "react-imported-component/boot";

    default:
      return false;
  }
}

function macro({references, state, babel}: any) {
  const {types: t} = babel;

  const imports: Record<string, string[]> = {};
  const transformer = createTransformer(babel);

  Object
    .keys(references)
    .forEach((tagName: string) => {
      const origin = getMacroType(tagName);
      if (origin) {
        imports[origin] = imports[origin] || [];
        imports[origin].push(tagName);
        const tags = references[tagName];
        tags.forEach((tag: any) => {
          let expression = tag.parentPath;

          if (t.isCallExpression(expression)) {
            transformer.traverse(expression, state.file)
          }
        });
      }
    });

  if (addReactImports(babel, state, imports)) {
    transformer.finish(state.file.path.node);
  }
}

function addReactImports(babel: any, state: any, importsGroups: Record<string, string[]>) {

  const {types: t} = babel;

  return (
    Object
      .keys(importsGroups)
      .map(origin => {
        const imports = importsGroups[origin];

        if (!imports.length) return false;

        const importedImport = state.file.path.node.body.find(
          (importNode: any) =>
            t.isImportDeclaration(importNode) &&
            importNode.source.value === origin
        );

        // Handle adding the import or altering the existing import
        if (importedImport) {
          imports.forEach(name => {
            if (
              !importedImport.specifiers.find(
                (specifier: any) => specifier.imported && specifier.imported.name === name
              )
            ) {
              importedImport.specifiers.push(
                t.importSpecifier(t.identifier(name), t.identifier(name))
              )
            }
          })
        } else {
          state.file.path.node.body.unshift(
            t.importDeclaration(
              imports.map(name =>
                t.importSpecifier(t.identifier(name), t.identifier(name))
              ),
              t.stringLiteral(origin)
            )
          )
        }

        return true;
      })
      .some(Boolean)
  );
}

const neverCallMe: any = () => {
  throw new Error('you have used `react-imported-component/macro` without `babel-plugin-macro` or `react-hot-loader/babel` installed')
};

const lazy: typeof import('./HOC').lazy = neverCallMe;
const imported: typeof import('./HOC').default = neverCallMe;
const useImported: typeof import('./useImported').useImported = neverCallMe;

export {lazy, imported, useImported, assignImportedComponents};

export default createMacro(macro)