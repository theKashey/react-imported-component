import { isBackend } from './utils/detectBackend';

const rejectNetwork = (url: string) => url.indexOf('http') !== 0;

/**
 * client-side only imported settings
 */
interface ImportedClientSettings {
  /**
   * enabled hot module replacement
   * @autoconfig enabled if HMR is detected
   */
  hot: boolean;
  /**
   * Sets SSR mode
   * @autoconfig autodetects environment
   */
  SSR: boolean;
  /**
   * rethrows errors from loading
   * @autoconfig enabled in development
   */
  rethrowErrors: boolean;
  /**
   * Controls which imports should be controlled via imported
   * @default - everything non http
   */
  fileFilter: (url: string) => boolean;
  /**
   * Controls import signature matching
   * - true(default): checks signatures
   * - false: uses "marks"(file names) only
   */
  checkSignatures: boolean;
}

export const settings: ImportedClientSettings = {
  hot: (!!module as any).hot,
  SSR: isBackend,
  rethrowErrors: process.env.NODE_ENV !== 'production',
  fileFilter: rejectNetwork,
  checkSignatures: true,
};

/**
 * allows fine tune imported logic
 * client side only!
 * @internal
 * @see configuration via imported.json {@link https://github.com/theKashey/react-imported-component#importedjs}
 */
export const setConfiguration = (config: Partial<ImportedClientSettings>) => {
  Object.assign(settings, config);
};
