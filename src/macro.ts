// @ts-ignore
import {createMacro} from "babel-plugin-macros";

import {createTransformer} from "./babel"

function getMacroType(tagName: string) {
  switch (tagName) {
    case "imported":
    case "lazy":
    case "useImported":
      return true;

    default:
      return false;
  }
}

function macro({references, state, babel}: any) {
  const {types: t} = babel;

  const imports: string[] = [];
  const transformer = createTransformer(babel);

  Object
    .keys(references)
    .forEach((tagName: string) => {
      if (getMacroType(tagName)) {
        imports.push(tagName);
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

function addReactImports(babel: any, state: any, imports: string[]) {
  if (!imports.length) return false;

  const {types: t} = babel;

  const importedImport = state.file.path.node.body.find(
    (importNode: any) =>
      t.isImportDeclaration(importNode) &&
      importNode.source.value === "react-imported-component"
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
        t.stringLiteral("react-imported-component")
      )
    )
  }

  return true;
}

const lazy: typeof import('./HOC').lazy = null as any;
const imported: typeof import('./HOC').default = null as any;
const useImported: typeof import('./useImported').useImported = null as any;
const assignImportedComponents: typeof import('./loadable').assignImportedComponents = null as any;

export {lazy, imported, useImported, assignImportedComponents};

export default createMacro(macro)