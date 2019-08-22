import {transform} from '@babel/core'
import {join} from 'path'
import {readdirSync, statSync, readFileSync} from 'fs';

const FIXTURE_PATH = join(__dirname, '__fixtures__/babel');

const testFolders:string[] =
  readdirSync(FIXTURE_PATH)
    .filter(file =>
      statSync(join(FIXTURE_PATH, file)).isDirectory(),
    );

const testPlugin = {
  node: (code: string) => {
    const result = transform(code, {
      presets: ['@babel/preset-react'],
      plugins: [require.resolve('../dist/es5/babel'), 'dynamic-import-node'],
    });

    return result.code;
  },
  webpack: (code: string) => {
    const result = transform(code, {
      presets: ['@babel/preset-react'],
      plugins: [require.resolve('../dist/es5/babel')]
    });

    return result.code;
  }
};

describe('babel', () => {
  testFolders.forEach(folderName => {
    const actual = readFileSync(
      join(FIXTURE_PATH, folderName, 'actual.js'),
      'utf8',
    );
    const expected = readFileSync(
      join(FIXTURE_PATH, folderName, 'expected.js'),
      'utf8',
    );

    it(`works with ${folderName}`, () => {
      const result = testPlugin[folderName](actual)
      expect(result.trim()).toBe(expected.trim())
    })
  })
})