/**
 * react-imported-component configuration
 * __TO BE USED AT `imported.js`__
 * @see {@link https://github.com/theKashey/react-imported-component#.imported.js}
 */
export interface ImportedConfiguration {
  /**
   * tests if this file should scanned by `imported-component`
   * @param fileName - source file name
   * @returns {Boolean} true - if should, false - is should not
   * @example
   * // hides node modules
   * testFile(filename) { return !filename.test(/node_modules/); }
   */
  testFile?: (fileName: string) => boolean;
  /**
   * tests if a given import should be visible to a `imported-component`
   * @param {String} targetFileName - import target
   * @param {String} sourceFileName - source filename
   * @param {Object} configuration - an import configuration
   * @returns {Boolean} false if import should be ignored by the `imported-components`
   * @example
   * testImport(filename, source, config) {
   *   return !(
   *     // no mjs please
   *     filename.indexOf('.mjs')===-1
   *     // no webpack-ignore please (don't do it)
   *     config.webpackIgnore
   *  )
   * }
   */
  testImport?: (targetFileName: string, sourceFileName: string, configuration: object) => boolean;
  /**
   * tests if this import should(or could) be executed only on ClientSide
   * @param targetFileName
   * @param sourceFileName
   * @returns {Boolean} true if only client side
   * @example
   * clientSideOnly(target) {
   *   return target.indexOf('polyfill')>0
   * }
   */
  clientSideOnly: (targetFileName: string, sourceFileName: string) => boolean;

  /**
   * marks import with prefetch comment (if possible)
   * @param targetFile
   * @param sourceFile
   * @param sourceConfiguration
   */
  shouldPrefetch: (targetFile: string, sourceFile: string, sourceConfiguration: object) => boolean;
  /**
   * marks import with preload comment (if possible)
   * @param targetFile
   * @param sourceFile
   * @param sourceConfiguration
   */
  shouldPreload: (targetFile: string, sourceFile: string, sourceConfiguration: object) => boolean;
  /**
   * adds custom chunkname to a import (if possible)
   * @param targetFile
   * @param sourceFile
   * @param givenChunkName
   * @returns
   *  {string} - a new chunk name
   *  {undefined} - keep as is
   *  {null} - remove
   */
  chunkName: (targetFile: string, sourceFile: string, givenChunkName: string | undefined) => string | null | undefined;
}

/**
 * react-imported-component configuration
 * @param config
 */
export const configure = (config: ImportedConfiguration):ImportedConfiguration => config;