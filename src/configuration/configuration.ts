import { ImportedClientSettings } from './config';

export interface KnownImportOptions {
  chunkName?: string;
  webpackChunkName?: string;

  webpackPreload?: boolean;
  webpackPrefetch?: boolean;
}

type ImportOptions = KnownImportOptions | Record<string, string | boolean>;

/**
 * @name ImportedConfiguration
 * react-imported-component configuration
 * __TO BE USED AT `imported.js`__
 * @see {@link https://github.com/theKashey/react-imported-component#-imported-js}
 */
export interface ImportedConfiguration {
  /**
   * tests folder during scanning process. Can be used to optimize scanning process.
   * @default ignores `node_modules` and `.*` directories
   * @returns boolean flag
   *   - true, dive in
   *   - false, stop here
   */
  testFolder?: (targetName: string) => boolean;
  /**
   * tests if this file should scanned by `imported-component`.
   * Keep in mind that you might consider removing (unit)test files from the scan
   * @param fileName - source file name
   * @returns {Boolean} true - if should, false - is should not
   * @example
   * // hides node modules
   * testFile(filename) { return !filename.test(/node_modules/); }
   */
  testFile?: (fileName: string) => boolean;
  /**
   * tests if a given import should be visible to a `imported-component`
   * This method is equivalent to `client-side` magic comment
   * @param {String} targetFileName - import target
   * @param {String} sourceFileName - source filename
   * @returns {Boolean} false if import should be ignored by the `imported-components`
   * @see {@link https://github.com/theKashey/react-imported-component/#server-side-auto-import}
   * @example
   * //a.js -> source
   *  import('./b.js) -> target
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
  testImport?: (targetFileName: string, sourceFileName: string) => boolean;
  /**
   * marks import with prefetch comment (if possible)
   * @param {String} targetFile
   * @param {String} sourceFile
   * @param sourceConfiguration
   */
  shouldPrefetch?: (targetFile: string, sourceFile: string, sourceConfiguration: ImportOptions) => boolean;
  /**
   * marks import with preload comment (if possible)
   * @param {String} targetFile
   * @param {String} sourceFile
   * @param sourceConfiguration
   */
  shouldPreload?: (targetFile: string, sourceFile: string, sourceConfiguration: ImportOptions) => boolean;
  /**
   * adds custom chunkname to a import (if possible)
   * @param {String} targetFile
   * @param {String} sourceFile
   * @param {String|undefined} givenChunkName
   * @returns
   *  {string} - a new chunk name
   *  {undefined} - keep as is
   *  {null} - keep as is (will remove in the future)
   */
  chunkName?: (targetFile: string, sourceFile: string, importOptions: ImportOptions) => string | null | undefined;

  /**
   * clientside configuration properties to be passed into `setConfiguration`
   */
  configuration?: Partial<ImportedClientSettings>;

  /**
   * Allowing for module name overrides, helpful for when you re-export wrappers.
   */
  modules?: {
    /**
     * The root module name
     * 
     * @default "react-imported-component"
     */
    native?: string;

    /**
     * The imported wrapper module name.
     * 
     * @default "react-imported-component/wrapper"
     */
    wrapper?: string;

    /**
     * When using the macro pathways.
     * 
     * @defaults "react-imported-component/macro"
     */
    macro?: string;

    /**
     * The module to ues during boot.
     * 
     * @defaults "react-imported-component/boot"
     */
    boot?: string;
  }
}

/**
 * provides react-imported-component configuration
 * @param {ImportedConfiguration} config
 */
export const configure = (config: ImportedConfiguration): ImportedConfiguration => config;
