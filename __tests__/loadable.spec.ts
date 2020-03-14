import { getLoadable } from '../src/loadable';

describe('getLoadable', () => {
  const importedWrapper = (_: any, b: any) => b;

  it('cache test - should use mark', () => {
    const l1 = getLoadable(() => importedWrapper('imported_mark1_component', Promise.resolve(42)));
    const l2 = getLoadable(() => importedWrapper('imported_mark1_component', Promise.resolve(42)));

    expect(l1).toEqual(l2);
  });

  it('cache test - no mark present', () => {
    const l1 = getLoadable(() => Promise.resolve(42));
    const l2 = getLoadable(() => Promise.resolve(42));

    expect(l1).not.toEqual(l2);
  });
});
