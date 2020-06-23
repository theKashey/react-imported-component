import { transform } from '@babel/core';
import { readFileSync } from 'fs';
import { join } from 'path';
import { ImportedConfiguration } from '../src/configuration/configuration';

const FIXTURE_PATH = join(__dirname, '__fixtures__/babel');

const configuration: ImportedConfiguration = {
  shouldPreload: filename => filename.indexOf('PreloadThis') >= 0,
  shouldPrefetch: filename => filename.indexOf('ChunkThis') >= 0,
  chunkName: filename => (filename.indexOf('ChunkThis') >= 0 ? 'chunked-this' : undefined),
};

const testPlugin = {
  node: (code: string) => {
    const result = transform(code, {
      presets: ['@babel/preset-react'],
      plugins: [require.resolve('../dist/es5/entrypoints/babel'), 'dynamic-import-node'],
    });

    return result!.code;
  },
  webpack: (code: string) => {
    const result = transform(code, {
      presets: ['@babel/preset-react'],
      plugins: [[require.resolve('../dist/es5/entrypoints/babel'), configuration]],
    });

    return result!.code;
  },
  boot: (code: string) => {
    const result = transform(code, {
      presets: ['@babel/preset-react'],
      plugins: [[require.resolve('../dist/es5/entrypoints/babel'), configuration]],
    });

    return result!.code;
  },
};

describe('babel', () => {
  Object.keys(testPlugin).forEach(folderName => {
    const actual = readFileSync(join(FIXTURE_PATH, folderName, 'actual.js'), 'utf8');
    const expected = readFileSync(join(FIXTURE_PATH, folderName, 'expected.js'), 'utf8');

    it(`works with ${folderName}`, () => {
      const result = (testPlugin as any)[folderName](actual);
      expect(result.trim()).toBe(expected.trim());
    });
  });
});
