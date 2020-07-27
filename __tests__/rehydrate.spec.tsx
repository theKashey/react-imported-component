import '@theuiteam/lib-builder/configs/setupEnzyme';
import { mount } from 'enzyme';
import * as React from 'react';
import * as ReactDOM from 'react-dom/server';
import { act } from 'react-dom/test-utils';

import { setConfiguration } from '../src/configuration/config';
import { done as whenDone, toLoadable } from '../src/loadable/loadable';
import { createLoadableStream, drainHydrateMarks, rehydrateMarks } from '../src/loadable/marks';
import { ImportedComponent } from '../src/ui/Component';
import { ImportedStream } from '../src/ui/context';
import imported from '../src/ui/HOC';

jest.mock('../src/utils/detectBackend', () => ({ isBackend: true }));

describe('SSR Component', () => {
  const TargetComponent = ({ payload }: any) => <div>42 - {payload}</div>;

  function importedWrapper<T>(_: any, realImport: T) {
    return realImport;
  }

  describe('client-rehydrate', () => {
    beforeEach(() => {
      setConfiguration({ SSR: false });
    });
    afterEach(() => {
      setConfiguration({ SSR: true });
    });

    it('SSR green case', async () => {
      const Component = () => <div>loaded!</div>;

      const loader = toLoadable(() => Promise.resolve(Component));
      let wrapper1: any;

      await loader.load();

      act(() => {
        wrapper1 = mount(<ImportedComponent loadable={loader} />);
      });
      expect(wrapper1.html()).toContain('loaded!');
    });

    it('green case', async () => {
      const renderSpy1 = jest.fn().mockImplementation(A => <div>1 {A && <A />}</div>);
      const renderSpy2 = jest.fn().mockImplementation(A => <div>2 {A && <A />}</div>);
      const Component = () => <div>loaded!</div>;

      const loader = toLoadable(() => Promise.resolve(Component));
      let wrapper1: any;

      act(() => {
        wrapper1 = mount(
          <div>
            <ImportedComponent loadable={loader} render={renderSpy1} />
          </div>
        );
      });
      expect(wrapper1.html()).not.toContain('loaded!');

      expect(renderSpy1).toHaveBeenCalledWith(undefined, { error: undefined, loading: true }, undefined);

      await loader.load();
      const wrapper2 = mount(
        <div>
          <ImportedComponent loadable={loader} render={renderSpy2} />
        </div>
      );
      expect(wrapper2.html()).toContain('loaded!');
      expect(renderSpy1).toHaveBeenCalledWith(Component, { error: undefined, loading: undefined }, undefined);
      expect(renderSpy2).toHaveBeenCalledWith(Component, { error: undefined, loading: undefined }, undefined);
      expect(renderSpy1).toHaveBeenCalledTimes(2);
      expect(renderSpy2).toHaveBeenCalledTimes(1);
    });

    it('with precache', async () => {
      const renderSpy1 = jest.fn().mockImplementation(A => <div>{A && <A />}</div>);
      const Component = () => <div>loaded!</div>;

      const HotComponent = imported(() => Promise.resolve(Component), { noAutoImport: true });
      await HotComponent.preload();

      const wrapper2 = mount(
        <div>
          <HotComponent importedProps={{ render: renderSpy1 }} />
        </div>
      );
      expect(wrapper2.html()).toContain('loaded!');
      expect(renderSpy1).toHaveBeenCalledWith(Component, { error: undefined, loading: undefined }, {});
      expect(renderSpy1).toHaveBeenCalledTimes(1);
    });

    it('without precache', () => {
      const renderSpy2 = jest.fn().mockImplementation(A => <div>is {A && <A />}!</div>);
      const Component = () => <div>loaded!</div>;

      const HotComponent = imported(() => Promise.resolve(Component), { noAutoImport: true });
      // HotComponent.preload();
      return Promise.resolve().then(() => {
        const wrapper2 = mount(
          <div>
            <HotComponent importedProps={{ render: renderSpy2 }} />
          </div>
        );
        expect(wrapper2).not.toContain('is loaded!!');
      });
    });
  });

  describe('server-rehydrate', () => {
    beforeEach(() => {
      setConfiguration({ SSR: false });
    });

    it('green case', async () => {
      const renderSpy2 = jest.fn().mockImplementation(A => <div>{A && <A />}</div>);
      const Component = () => <div>loaded!</div>;

      const loader = toLoadable(() => Promise.resolve(Component));
      await loader.load();
      const wrapper2 = ReactDOM.renderToString(
        <div>
          so it is <ImportedComponent loadable={loader} render={renderSpy2} />
        </div>
      );
      expect(wrapper2).toBe('<div data-reactroot="">so it is <div><div>loaded!</div></div></div>');
      expect(renderSpy2).toHaveBeenCalledWith(Component, { error: undefined, loading: undefined }, undefined);
    });
  });

  describe('marks', () => {
    afterEach(() => drainHydrateMarks());

    it('SSR Marks without stream', done => {
      expect(drainHydrateMarks()).toHaveLength(0);
      const loader1 = toLoadable(
        () => importedWrapper('imported_mark1_component', Promise.resolve(TargetComponent)),
        true
      );
      // await loaders to load
      setTimeout(() => {
        expect(drainHydrateMarks()).toHaveLength(0);
        ReactDOM.renderToString(<ImportedComponent loadable={loader1} />);

        expect(drainHydrateMarks()).toEqual(['mark1']);
        expect(drainHydrateMarks()).toHaveLength(0);

        done();
      }, 32);
    });

    it('SSR Marks with stream', done => {
      expect(drainHydrateMarks()).toHaveLength(0);
      const loader1 = toLoadable(
        () => importedWrapper('imported_mark1_component', Promise.resolve(TargetComponent)),
        true
      );
      // await loaders to load
      setTimeout(() => {
        expect(drainHydrateMarks()).toHaveLength(0);
        const stream = createLoadableStream();
        ReactDOM.renderToString(
          <ImportedStream stream={stream}>
            <ImportedComponent loadable={loader1} />
          </ImportedStream>
        );

        expect(stream).not.toBe(0);
        expect(drainHydrateMarks(stream)).toEqual(['mark1']);
        expect(drainHydrateMarks(stream)).toHaveLength(0);

        done();
      }, 32);
    });

    it.skip('should generate marks', async () => {
      expect(drainHydrateMarks()).toHaveLength(0);
      const loader1 = toLoadable(
        () => importedWrapper('imported_mark1_component', Promise.resolve(TargetComponent)),
        true
      );
      const loader2 = toLoadable(() => {
        importedWrapper('imported_mark2-1_component', Promise.resolve(TargetComponent));
        return importedWrapper('imported_mark2-2_component', Promise.resolve(TargetComponent));
      }, true);
      const loader3 = toLoadable(() => Promise.resolve(TargetComponent), true);

      await loader1.resolution;
      // await loaders to load

      expect(drainHydrateMarks()).toHaveLength(0);
      const w1 = mount(<ImportedComponent loadable={loader1} />);
      expect(w1.find(TargetComponent).length).toBe(1);
      expect(w1.find(TargetComponent).html()).toContain(42);
      expect(mount(<ImportedComponent loadable={loader2} />).html()).toContain(42);
      expect(mount(<ImportedComponent loadable={loader3} />).html()).toContain(42);

      expect(drainHydrateMarks()).toEqual(['mark1', 'mark2-1', 'mark2-2']);
      expect(drainHydrateMarks()).toHaveLength(0);
    });

    it('should render async', done => {
      expect(drainHydrateMarks()).toHaveLength(0);
      const loader = toLoadable(
        () => importedWrapper('imported_mark1-async_component', Promise.resolve(TargetComponent)),
        false
      );
      setImmediate(() => {
        expect(drainHydrateMarks()).toHaveLength(0);
        const wrapper1 = mount(<ImportedComponent loadable={loader} />);
        expect(drainHydrateMarks()).toEqual(['mark1-async']);
        expect(wrapper1.find(TargetComponent)).toHaveLength(0);
        setImmediate(() => {
          wrapper1.update();
          expect(wrapper1.find(TargetComponent).html()).toContain('42');
          done();
        });
      });
    });

    it('should render sync', done => {
      expect(drainHydrateMarks()).toHaveLength(0);
      const loader = toLoadable(() => importedWrapper('imported_mark1_component', Promise.resolve(TargetComponent)));

      rehydrateMarks(['mark1']);

      setImmediate(() => {
        expect(drainHydrateMarks()).toHaveLength(0);
        const wrapper = mount(<ImportedComponent loadable={loader} />);
        expect(drainHydrateMarks()).toEqual(['mark1']);
        expect(wrapper.find(TargetComponent)).not.toBe(undefined);
        done();
      });
    });

    describe('stream marks', () => {
      it('multy stream render', () => {
        expect(drainHydrateMarks()).toHaveLength(0);
        const loader1 = toLoadable(() => importedWrapper('imported_mark1_component', Promise.resolve(TargetComponent)));
        const loader2 = toLoadable(() => importedWrapper('imported_mark2_component', Promise.resolve(TargetComponent)));
        const loader3 = toLoadable(() => importedWrapper('imported_mark3_component', Promise.resolve(TargetComponent)));

        const uid2 = createLoadableStream();
        const uid3 = createLoadableStream();

        mount(<ImportedComponent loadable={loader1} />);
        mount(
          <ImportedStream stream={uid2}>
            <ImportedComponent loadable={loader2} />
          </ImportedStream>
        );
        mount(
          <ImportedStream stream={uid3}>
            <ImportedComponent loadable={loader3} />
            <ImportedComponent loadable={loader2} />
          </ImportedStream>
        );

        expect(drainHydrateMarks()).toEqual(['mark1']);
        expect(drainHydrateMarks(uid2)).toEqual(['mark2']);
        expect(drainHydrateMarks(uid3)).toEqual(['mark3', 'mark2']);
      });
    });
  });

  describe('done markers', () => {
    it('red case', () => {
      expect(drainHydrateMarks()).toHaveLength(0);
      const loader1 = toLoadable(() => new Promise(resolve => setImmediate(() => resolve(TargetComponent))), false);
      const loader2 = toLoadable(() => {
        loader1.load();
        return importedWrapper('imported_mark2_component', Promise.resolve(TargetComponent));
      }, false);
      expect(loader1.done).toBe(false);
      expect(loader2.done).toBe(false);
      return whenDone()
        .then(() => {
          expect(loader1.done).toBe(false);
          expect(loader2.done).toBe(false);
        })
        .then(() => rehydrateMarks(['mark2']))
        .then(a => a)
        .then(() => {
          expect(loader1.done).toBe(false);
          expect(loader2.done).toBe(true);
        });
    });

    it('should load the right marks', async () => {
      const loader1 = toLoadable(
        () => importedWrapper('imported_i-mark1_component', Promise.resolve(() => String('mark1'))),
        false
      );
      const loader2 = toLoadable(
        () => importedWrapper('imported_i-mark2_component', Promise.resolve(() => String('mark2'))),
        false
      );
      const loader3 = toLoadable(
        () => importedWrapper('imported_i-mark3_component', Promise.resolve(() => String('mark3'))),
        false
      );

      const mixedMark = toLoadable(
        () =>
          Promise.all([
            importedWrapper('imported_i-mark1_component', Promise.resolve(() => String('mark1'))),
            importedWrapper('imported_i-mark2_component', Promise.resolve(() => String('mark2'))),
          ]),
        false
      );

      rehydrateMarks(['i-mark1']);

      await loader1.resolution;

      expect(loader1.done).toBe(true);
      expect(loader2.done).toBe(false);
      expect(loader3.done).toBe(false);
      expect(mixedMark.done).toBe(false);

      rehydrateMarks(['i-mark2']);

      await loader2.resolution;

      expect(loader1.done).toBe(true);
      expect(loader2.done).toBe(true);
      expect(loader3.done).toBe(false);
      expect(mixedMark.done).toBe(false);

      rehydrateMarks(['i-mark2', 'i-mark1']);

      await mixedMark.resolution;

      expect(loader1.done).toBe(true);
      expect(loader2.done).toBe(true);
      expect(loader3.done).toBe(false);
      expect(mixedMark.done).toBe(true);
    });

    it('should load the right marks', async () => {
      const loader1 = toLoadable(
        () => importedWrapper('imported_i-mark1_component', Promise.resolve(() => String('mark1'))),
        false
      );
      const loader2 = toLoadable(
        () => importedWrapper('imported_i-mark2_component', Promise.resolve(() => String('mark2'))),
        false
      );
      const loader3 = toLoadable(
        () => importedWrapper('imported_i-mark3_component', Promise.resolve(() => String('mark3'))),
        false
      );

      const mixedMark = toLoadable(
        () =>
          Promise.all([
            importedWrapper('imported_i-mark1_component', Promise.resolve(() => String('mark1'))),
            importedWrapper('imported_i-mark2_component', Promise.resolve(() => String('mark2'))),
          ]),
        false
      );
      rehydrateMarks(['i-mark2', 'i-mark1']);

      await mixedMark.resolution;

      expect(loader1.done).toBe(true);
      expect(loader2.done).toBe(true);
      expect(loader3.done).toBe(false);
      expect(mixedMark.done).toBe(true);
    });

    it('should report loading complete', () => {
      expect(drainHydrateMarks()).toHaveLength(0);
      const loader1 = toLoadable(() => new Promise(resolve => setImmediate(() => resolve(TargetComponent))), false);
      const loader2 = toLoadable(() => {
        loader1.load();
        return importedWrapper('imported_mark2_component', Promise.resolve(TargetComponent));
      }, false);
      expect(loader1.done).toBe(false);
      expect(loader2.done).toBe(false);
      return whenDone()
        .then(() => {
          expect(loader1.done).toBe(false);
          expect(loader2.done).toBe(false);
        })
        .then(() => rehydrateMarks(['mark2']))
        .then(whenDone)
        .then(() => {
          expect(loader1.done).toBe(true);
          expect(loader2.done).toBe(true);
        });
    });
  });
});
