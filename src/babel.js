import syntax from 'babel-plugin-syntax-dynamic-import'

// this file is 99% babel.js from loadable-components

export default function({ types: t }) {
  return {
    inherits: syntax,

    visitor: {
      ImportDeclaration(path, {file}) {
        const source = path.node.source.value
        if (source !== 'react-imported-component') return

        const defaultSpecifier = path
          .get('specifiers')
          .find(specifier => specifier.isImportDefaultSpecifier())

        if (!defaultSpecifier) return

        const bindingName = defaultSpecifier.node.local.name
        const binding = path.scope.getBinding(bindingName)

        binding.referencePaths.forEach(refPath => {
          let callExpression = refPath.parentPath

          if (
            callExpression.isMemberExpression() &&
            callExpression.node.computed === false &&
            callExpression.get('property').isIdentifier({ name: 'Map' })
          ) {
            callExpression = callExpression.parentPath
          }

          if (!callExpression.isCallExpression()) return

          const args = callExpression.get('arguments')
          const loaderMethod = args[0]

          if (!loaderMethod) return

          const dynamicImports = []

          loaderMethod.traverse({
            Import({ parentPath }) {
              dynamicImports.push(parentPath)
            },
          })

          if (!dynamicImports.length) return

          let options = args[1]
          if (args[1]) {
            options = options.node
          } else {
            options = t.objectExpression([])
            callExpression.node.arguments.push(options)
          }

          options.properties.push(
            t.objectProperty(
              t.identifier('mark'),
              t.stringLiteral(
                dynamicImports.map(
                  dynamicImport => dynamicImport.get('arguments')[0].node.value
                ).join('-') + ':' + file.opts.filename,
              ),
            ),
          )
        })
      },
    },
  }
}