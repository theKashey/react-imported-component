import '@theuiteam/lib-builder/configs/setupEnzyme';
import { mount } from 'enzyme';
import * as React from 'react';
import { useEffect, useState } from 'react';

import { act } from 'react-dom/test-utils';
import { drainHydrateMarks } from '../src/entrypoints';
import { done, getLoadable, toLoadable } from '../src/loadable/loadable';
import { useImported } from '../src/ui/useImported';

const importedWrapper = (_: any, b: any) => b;

jest.mock('../src/utils/detectBackend', () => ({ isBackend: false }));

describe('useLoadable', () => {
  it('load mark', () => {
    toLoadable(() => 42 as any, false);
  });
});

describe('useImported', () => {
  const getSourceComponent = (importer: () => Promise<any>) => () => {
    const { imported: Component, error, loading } = useImported(importer);

    if (error) {
      return <span>error</span>;
    }

    if (Component) {
      return (
        <span>
          <Component />
        </span>
      );
    }

    if (loading) {
      return <span>loading</span>;
    }

    return <span>undefined</span>;
  };

  it('SSR mark', async () => {
    const TargetComponent = () => <div>loaded!</div>;
    const importer = () => importedWrapper('imported_mark0_component', Promise.resolve(TargetComponent));

    await getLoadable(importer).load();
    let SourceComponent: any;

    act(() => {
      SourceComponent = getSourceComponent(importer);
    });

    const wrapper = mount(<SourceComponent />);

    expect(wrapper.html()).toContain('loaded!');
    expect(drainHydrateMarks()).toEqual(['mark0']);
  });

  it('import mark', async () => {
    const TargetComponent = () => <div>loaded!</div>;
    const importer = () => importedWrapper('imported_mark1_component', Promise.resolve(TargetComponent));

    const SourceComponent = getSourceComponent(importer);

    const wrapper = mount(<SourceComponent />);
    expect(wrapper.html()).toContain('loading');
    expect(drainHydrateMarks()).toEqual(['mark1']);

    await act(async () => {
      await Promise.resolve();
    });

    expect(wrapper.html()).toContain('loaded!');
    expect(drainHydrateMarks()).toEqual([]);
  });

  it('error case', async () => {
    const importer = () => importedWrapper('imported_mark1_component', Promise.reject('404'));

    const SourceComponent = getSourceComponent(importer);

    const wrapper = mount(<SourceComponent />);
    expect(wrapper.html()).toContain('loading');
    expect(drainHydrateMarks()).toEqual(['mark1']);

    await act(async () => {
      await Promise.resolve();
    });

    expect(wrapper.html()).toContain('error');
    expect(drainHydrateMarks()).toEqual([]);
  });

  it('useImported memoization', async () => {
    const importers = [
      () => importedWrapper('imported_unconditional1-mark_component', Promise.resolve(() => <span>1!</span>)),
      () => importedWrapper('imported_unconditional2-mark_component', Promise.resolve(() => <span>2!</span>)),
    ];

    const Comp = ({ v }: any) => {
      const x = useImported(importers[v]);
      const [state, setState] = useState(0);
      useEffect(() => setState(oldState => oldState + 1), [x]);

      return <span>{state}</span>;
    };

    const wrapper = mount(<Comp v={0} />);
    expect(wrapper.html()).toContain('1');
    await act(done);
    wrapper.update();
    expect(wrapper.html()).toContain('2');
    wrapper.update();
    expect(wrapper.html()).toContain('2');
    wrapper.setProps({ v: 1 });
    expect(wrapper.html()).toContain('3');
    await act(done);
    expect(wrapper.html()).toContain('4');
    drainHydrateMarks();
    // expect().toEqual(['unconditional-mark']);
  });

  it('unconditional import', async () => {
    const importer = () =>
      importedWrapper('imported_unconditional-mark_component', Promise.resolve(() => <span>loaded!</span>));

    const Comp = ({ loadit }: any) => {
      const { loading, imported: Component } = useImported(importer, undefined, { import: loadit });

      if (Component) {
        return <Component />;
      }

      if (loading) {
        return <span>loading</span>;
      }
      return <span>nothing</span>;
    };

    const wrapper = mount(<Comp loadit={true} />);
    expect(wrapper.html()).toContain('loading');

    await act(async () => {
      await Promise.resolve();
    });

    expect(wrapper.update().html()).toContain('loaded!');
    expect(drainHydrateMarks()).toEqual(['unconditional-mark']);
  });

  it('conditional import', async () => {
    const importer = () =>
      importedWrapper('imported_conditional-mark_component', Promise.resolve(() => <span>loaded!</span>));

    const Comp = ({ loadit }: any) => {
      const { loading, imported: Component } = useImported(importer, undefined, { import: loadit });

      if (Component) {
        return <Component />;
      }

      if (loading) {
        return <span>loading</span>;
      }
      return <span>nothing</span>;
    };

    const wrapper = mount(<Comp loadit={false} />);
    expect(wrapper.html()).toContain('nothing');

    await act(async () => {
      await Promise.resolve();
    });

    expect(wrapper.update().html()).toContain('nothing');
    wrapper.setProps({ loadit: true });
    expect(wrapper.update().html()).toContain('loading');

    await act(async () => {
      await done();
    });

    expect(wrapper.update().html()).toContain('loaded!');
    expect(drainHydrateMarks()).toEqual(['conditional-mark']);
  });

  it('conditional import selection', async () => {
    const importer1 = () =>
      importedWrapper('imported_conditional-1-mark_component', Promise.resolve(() => <span>version1</span>));
    const importer2 = () =>
      importedWrapper('imported_conditional-2-mark_component', Promise.resolve(() => <span>version2</span>));

    const Comp = ({ version }: any) => {
      const { loading, imported: Component } = useImported(version === 1 ? importer1 : importer2);

      if (Component) {
        return <Component />;
      }

      if (loading) {
        return <span>loading</span>;
      }
      return <span>nothing</span>;
    };

    const wrapper = mount(<Comp version={1} />);
    expect(wrapper.update().html()).toContain('loading');

    await act(done);

    expect(wrapper.update().html()).toContain('version1');
    wrapper.setProps({ version: 2 });
    expect(wrapper.update().html()).toContain('loading');

    await act(done);

    expect(wrapper.update().html()).toContain('version2');
    expect(drainHydrateMarks()).toEqual(['conditional-1-mark', 'conditional-2-mark']);
  });

  it('cached import', async () => {
    // this test is not working as it should (it should be broken)
    const importer = () => () => <span>loaded!</span>;

    const Comp = () => {
      const { loading, imported: Component } = useImported(importer as any);

      if (Component) {
        return <Component />;
      }

      if (loading) {
        return <span>loading</span>;
      }
      return <span>nothing</span>;
    };

    const wrapper = mount(<Comp />);
    expect(wrapper.html()).toContain('loading');
    expect(wrapper.update().html()).toContain('loading');

    await act(async () => {
      await done();
    });

    expect(wrapper.update().html()).toContain('loaded!');
  });
});
